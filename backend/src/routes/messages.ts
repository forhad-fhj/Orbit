import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { verifyGenderAccess } from '../lib/gender';

const router = express.Router();

const createMessageSchema = z.object({
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

router.get('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userGender = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { gender: true },
    });

    if (!userGender) {
      return res.status(401).json({ error: 'User not found' });
    }

    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            gender: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            gender: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filteredConversations = conversations.filter((message) => {
      const partner = message.senderId === req.userId ? message.receiver : message.sender;
      return partner.gender === userGender.gender;
    });

    const conversationMap = new Map();
    filteredConversations.forEach((message) => {
      const partnerId = message.senderId === req.userId 
        ? message.receiverId 
        : message.senderId;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner: message.senderId === req.userId ? message.receiver : message.sender,
          lastMessage: message,
          unreadCount: 0,
        });
      }
      
      if (!message.isRead && message.receiverId === req.userId) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    res.json({ conversations: Array.from(conversationMap.values()) });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const genderCheck = await verifyGenderAccess(req.userId!, req.params.userId);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.userId },
        ],
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
      orderBy: { createdAt: 'asc' },
    });

    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createMessageSchema.parse(req.body);

    const genderCheck = await verifyGenderAccess(req.userId!, data.receiverId);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.create({
      data: {
        ...data,
        senderId: req.userId!,
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

    res.status(201).json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
router.put('/:userId/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

