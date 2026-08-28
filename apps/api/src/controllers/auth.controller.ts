import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '@socialplatform/prisma';
import { OnboardingPayload, BaseResponse, GoogleAuthResponse, UserDTO } from '@socialplatform/shared-types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Must be true when sameSite is 'none'
  sameSite: 'none' as const, // Required for cross-origin cookies (Vercel → Render)
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Shared logic: find-or-create user from Google payload, set cookies
async function handleGooglePayload(
  payload: { sub: string; email: string; name?: string; picture?: string },
  res: Response
) {
  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name || 'User';
  const avatarUrl = payload.picture;

  const existingUser = await prisma.user.findUnique({ where: { googleId } });

  if (existingUser) {
    const token = jwt.sign(
      { userId: existingUser.id, role: existingUser.role, gender: existingUser.gender },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    const userDto: UserDTO = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.displayName,
      gender: existingUser.gender,
      avatarUrl: existingUser.avatarUrl || undefined,
      createdAt: existingUser.createdAt,
    };

    const response: BaseResponse<GoogleAuthResponse> = {
      success: true,
      data: { isPending: false, user: userDto },
    };
    return res.json(response);
  } else {
    const pendingToken = jwt.sign(
      { googleId, email, name, avatarUrl },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.cookie('pending_auth', pendingToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 1000 });

    const response: BaseResponse<GoogleAuthResponse> = {
      success: true,
      data: { isPending: true },
    };
    return res.json(response);
  }
}

// Legacy: id_token from GIS popup (kept for backward compat)
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential missing' });
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ success: false, error: 'Invalid Google payload' });
    }
    return handleGooglePayload(payload, res);
  } catch (error: any) {
    console.error('Google Login Error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

// New: OAuth2 authorization code exchange (redirect flow — no popup, no COOP issues)
export const googleCodeLogin = async (req: Request, res: Response) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) {
      return res.status(400).json({ success: false, error: 'Missing code or redirectUri' });
    }

    // Exchange auth code for tokens at Google's token endpoint
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenData.id_token) {
      console.error('Token exchange failed:', tokenData);
      return res.status(400).json({ success: false, error: 'Failed to exchange auth code' });
    }

    // Verify the id_token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenData.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ success: false, error: 'Invalid Google token payload' });
    }

    return handleGooglePayload(payload, res);
  } catch (error: any) {
    console.error('Google Code Login Error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const pendingToken = req.cookies.pending_auth;
    if (!pendingToken) {
      return res.status(401).json({ success: false, error: 'No pending onboarding session found' });
    }

    let pendingData: any;
    try {
      pendingData = jwt.verify(pendingToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired onboarding session' });
    }

    const { username, gender, dateOfBirth } = req.body as OnboardingPayload;

    if (!username || !gender || !dateOfBirth) {
      return res.status(400).json({ success: false, error: 'Missing required onboarding fields' });
    }

    // DOB validation (must be 13+)
    const dob = new Date(dateOfBirth);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 13) {
      return res.status(400).json({ success: false, error: 'You must be at least 13 years old.' });
    }

    // Check username
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ success: false, error: 'Username is already taken' });
    }

    // Check email to be absolutely sure
    const existingEmail = await prisma.user.findUnique({ where: { email: pendingData.email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'Account with this email already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        googleId: pendingData.googleId,
        email: pendingData.email,
        username,
        displayName: pendingData.name,
        gender: gender,
        avatarUrl: pendingData.avatarUrl,
        dateOfBirth: dob
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, gender: newUser.gender },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, COOKIE_OPTIONS);
    res.clearCookie('pending_auth');

    const userDto: UserDTO = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.displayName,
      gender: newUser.gender,
      avatarUrl: newUser.avatarUrl || undefined,
      createdAt: newUser.createdAt
    };

    const response: BaseResponse<{ user: UserDTO }> = {
      success: true,
      data: { user: userDto }
    };
    return res.json(response);

  } catch (error: any) {
    console.error('Complete Onboarding Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to complete onboarding' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
       return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userDto: UserDTO = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.displayName,
      gender: dbUser.gender,
      avatarUrl: dbUser.avatarUrl || undefined,
      createdAt: dbUser.createdAt
    };

    return res.json({ success: true, data: { user: userDto } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.clearCookie('pending_auth');
  return res.json({ success: true, message: 'Logged out successfully' });
};
