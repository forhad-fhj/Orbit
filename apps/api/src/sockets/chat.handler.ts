import { Server, Socket } from 'socket.io';
import { prisma } from '@socialplatform/prisma';
import { verifyGenderAccess } from '../services/access.service';
import { ForbiddenError } from '../utils/errors';
import { createNotification } from './notification.handler';

const onlineUsers = new Map<string, { socketId: string; lastSeen: Date }>();

export const getOnlineUsers = () => onlineUsers;

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const user = socket.data.user;
  if (!user) return;

  onlineUsers.set(user.userId, { socketId: socket.id, lastSeen: new Date() });
  io.emit('presence:online', { userId: user.userId });

  socket.on('chat:send', async (payload: { conversationId?: string; recipientId?: string; content?: string; mediaUrl?: string }, callback) => {
    try {
      const blockedIds = user.blockedIds || [];

      if (payload.recipientId) {
        if (blockedIds.includes(payload.recipientId)) {
          return callback?.({ success: false, error: 'Cannot message this user' });
        }

        const recipient = await prisma.user.findUnique({
          where: { id: payload.recipientId },
          select: { gender: true }
        });

        if (!recipient) return callback?.({ success: false, error: 'Recipient not found' });

        verifyGenderAccess(user.gender, recipient.gender);

        let conversation: any;
        if (payload.conversationId) {
          conversation = await prisma.conversation.findUnique({ where: { id: payload.conversationId } });
        } else {
          const existing = await prisma.conversation.findFirst({
            where: {
              isGroup: false,
              AND: [
                { participants: { some: { userId: user.userId } } },
                { participants: { some: { userId: payload.recipientId } } }
              ]
            }
          });

          if (existing) {
            conversation = existing;
          } else {
            conversation = await prisma.conversation.create({
              data: {
                isGroup: false,
                participants: {
                  create: [
                    { userId: user.userId },
                    { userId: payload.recipientId }
                  ]
                }
              }
            });
          }
        }

        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: user.userId,
            content: payload.content,
            mediaUrl: payload.mediaUrl,
          },
          include: {
            sender: { select: { id: true, username: true, avatarUrl: true } }
          }
        });

        io.to(`user_${payload.recipientId}`).emit('chat:receive', {
          message,
          conversationId: conversation.id
        });

        await createNotification(io, {
          userId: payload.recipientId,
          actorId: user.userId,
          type: 'MESSAGE',
          targetId: conversation.id
        });

        callback?.({ success: true, data: { message, conversationId: conversation.id } });
      }
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return callback?.({ success: false, error: error.message });
      }
      console.error(error);
      callback?.({ success: false, error: 'Internal server error' });
    }
  });

  socket.on('chat:typing', (payload: { conversationId: string }) => {
    socket.to(`conv_${payload.conversationId}`).emit('chat:typing', {
      userId: user.userId,
      conversationId: payload.conversationId
    });
  });

  socket.on('chat:stop_typing', (payload: { conversationId: string }) => {
    socket.to(`conv_${payload.conversationId}`).emit('chat:stop_typing', {
      userId: user.userId,
      conversationId: payload.conversationId
    });
  });

  socket.on('chat:read', async (payload: { conversationId: string }) => {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId: payload.conversationId,
          senderId: { not: user.userId },
          readAt: null
        },
        data: { readAt: new Date() }
      });

      socket.to(`conv_${payload.conversationId}`).emit('chat:read_receipt', {
        conversationId: payload.conversationId,
        readBy: user.userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('chat:join_rooms', async () => {
    try {
      const participations = await prisma.conversationParticipant.findMany({
        where: { userId: user.userId },
        select: { conversationId: true }
      });
      participations.forEach((p: any) => {
        socket.join(`conv_${p.conversationId}`);
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', () => {
    const lastSeen = new Date();
    onlineUsers.delete(user.userId);
    io.emit('presence:offline', { userId: user.userId, lastSeen });
  });
};
