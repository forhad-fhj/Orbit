import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const blockedIds = req.user!.blockedIds || [];
    const limit = parseInt(req.query.limit as string) || 30;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        actorId: { notIn: blockedIds }
      },
      include: {
        actor: { select: { id: true, username: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { ids } = req.body;

    if (ids && Array.isArray(ids)) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const blockedIds = req.user!.blockedIds || [];

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        actorId: { notIn: blockedIds }
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
