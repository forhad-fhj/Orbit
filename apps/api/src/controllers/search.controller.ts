import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const search = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    const type = (req.query.type as string) || 'all';
    const userGender = req.user!.gender as 'MALE' | 'FEMALE';
    const blockedIds = req.user!.blockedIds || [];

    const result: { users: any[]; hashtags: any[]; groups: any[] } = {
      users: [],
      hashtags: [],
      groups: [],
    };

    if (type === 'all' || type === 'users') {
      result.users = await (prisma.user as any).findManySameGender(userGender, {
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true },
        take: 10,
      }, blockedIds);
    }

    if (type === 'all' || type === 'hashtags') {
      result.hashtags = await prisma.hashtag.findMany({
        where: { tag: { contains: q, mode: 'insensitive' } },
        take: 10,
        include: { _count: { select: { posts: true } } },
      });
    }

    if (type === 'all' || type === 'groups') {
      result.groups = await (prisma.group as any).findManySameGender(userGender, {
        where: {
          name: { contains: q, mode: 'insensitive' },
          isPrivate: false,
        },
        select: { id: true, name: true, coverPhotoUrl: true },
        take: 10,
        include: { _count: { select: { members: true } } },
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
