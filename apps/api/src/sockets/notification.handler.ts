import { Server } from 'socket.io';
import { prisma } from '@socialplatform/prisma';

interface NotificationPayload {
  userId: string;
  actorId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_REQUEST' | 'MESSAGE' | 'GROUP_INVITE';
  targetId: string;
}

export const createNotification = async (io: Server, payload: NotificationPayload) => {
  try {
    if (payload.userId === payload.actorId) return;

    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        actorId: payload.actorId,
        type: payload.type,
        targetId: payload.targetId
      },
      include: {
        actor: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    io.to(`user_${payload.userId}`).emit('notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
