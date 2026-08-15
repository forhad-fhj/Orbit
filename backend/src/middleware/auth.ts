import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  cookies: {
    token?: string;
  };
}

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract JWT token from request
 * Supports both HttpOnly cookies and Authorization header
 */
function extractToken(req: AuthRequest): string | null {
  // First, try to get token from HttpOnly cookie (preferred)
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  // Fallback to Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Verify and decode JWT token
 */
function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    }
    throw error;
  }
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches userId to request
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from request
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided. Please login to access this resource.',
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      res.status(403).json({
        error: 'Invalid token',
        message: 'Token is missing required information.',
      });
      return;
    }

    // Attach userId to request
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    // Handle specific JWT errors
    if (error.message === 'Token expired') {
      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.',
      });
      return;
    }

    if (error.message === 'Invalid token') {
      res.status(403).json({
        error: 'Invalid token',
        message: 'The provided token is invalid.',
      });
      return;
    }

    // Generic error
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication.',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches userId if token is present, but doesn't require it
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export function optionalAuthenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        req.userId = decoded.userId;
      }
    }
  } catch (error) {
    // Silently fail for optional auth - just don't set userId
    // This allows the request to continue without authentication
  }

  next();
}

/**
 * Enhanced authentication with user validation
 * Verifies token AND checks if user still exists in database
 * Use this for critical operations
 */
export async function authenticateTokenWithUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First, verify token
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided. Please login to access this resource.',
      });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      res.status(403).json({
        error: 'Invalid token',
        message: 'Token is missing required information.',
      });
      return;
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      res.status(403).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists.',
      });
      return;
    }

    // Attach user info to request
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error: any) {
    if (error.message === 'Token expired') {
      res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.',
      });
      return;
    }

    if (error.message === 'Invalid token') {
      res.status(403).json({
        error: 'Invalid token',
        message: 'The provided token is invalid.',
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication.',
    });
  }
}

/**
 * Check if request is authenticated
 * Returns true if userId is set, false otherwise
 */
export function isAuthenticated(req: AuthRequest): boolean {
  return !!req.userId;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in route handlers to ensure authentication
 */
export function requireAuth(req: AuthRequest): void {
  if (!req.userId) {
    throw new Error('Authentication required');
  }
}

