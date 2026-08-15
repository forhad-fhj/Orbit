import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthJWTPayload } from '@socialplatform/shared-types';
import { prisma } from '@socialplatform/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: AuthJWTPayload;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthJWTPayload;
    
    // Fetch blocks to avoid global N+1 across queries
    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: decoded.userId },
          { blockedId: decoded.userId }
        ]
      },
      select: { blockerId: true, blockedId: true }
    });
    
    const blockedIds = blocks.map(b => b.blockerId === decoded.userId ? b.blockedId : b.blockerId);
    decoded.blockedIds = blockedIds;

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
