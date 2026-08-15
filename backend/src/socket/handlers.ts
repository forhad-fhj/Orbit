import { Socket, Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { verifyGenderAccess } from '../lib/gender';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  join: (room: string) => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
}

export function handleConnection(socket: AuthenticatedSocket, io: Server) {
  // Authenticate socket connection
  socket.on('authenticate', async (token: string) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      socket.join(`user:${decoded.userId}`);
      console.log(`User authenticated: ${decoded.userId}`);
    } catch (error) {
      console.error('Socket authentication failed:', error);
    }
  });

  socket.on('send_message', async (data: { receiverId: string; content: string }) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const genderCheck = await verifyGenderAccess(socket.userId, data.receiverId);
      if (!genderCheck.allowed) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          senderId: socket.userId,
          receiverId: data.receiverId,
          content: data.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      io.to(`user:${data.receiverId}`).emit('new_message', message);
      socket.emit('message_sent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
    if (!socket.userId) return;
    io.to(`user:${data.receiverId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: data.isTyping,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}

