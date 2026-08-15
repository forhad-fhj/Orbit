import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalPosts, dauCount, recentPosts, recentSignups] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.user.count({
        where: { updatedAt: { gte: todayStart } },
      }),
      prisma.post.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { _all: true },
      }),
    ]);

    const postsByDay: Record<string, number> = {};
    recentPosts.forEach((row: any) => {
      const day = new Date(row.createdAt).toISOString().split('T')[0];
      postsByDay[day] = (postsByDay[day] || 0) + row._count._all;
    });

    const signupsByDay: Record<string, number> = {};
    recentSignups.forEach((row: any) => {
      const day = new Date(row.createdAt).toISOString().split('T')[0];
      signupsByDay[day] = (signupsByDay[day] || 0) + row._count._all;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        dau: dauCount,
        postsByDay,
        signupsByDay,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Cannot suspend an admin' });
    }

    await prisma.user.update({
      where: { id },
      data: { role: 'MODERATOR' },
    });

    res.json({ success: true, message: `User ${id} suspended (role set to MODERATOR for review)` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const resolveReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
