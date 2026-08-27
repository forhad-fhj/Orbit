import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthJWTPayload } from '@socialplatform/shared-types';
import { prisma } from '@socialplatform/prisma';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('Authentication error: No cookies found'));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('='))
    );
    
    const token = cookies['auth_token'];
    if (!token) {
      return next(new Error('Authentication error: auth_token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthJWTPayload;

    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: decoded.userId },
          { blockedId: decoded.userId }
        ]
      },
      select: { blockerId: true, blockedId: true }
    });
    decoded.blockedIds = blocks.map((b: any) => b.blockerId === decoded.userId ? b.blockedId : b.blockerId);

    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

