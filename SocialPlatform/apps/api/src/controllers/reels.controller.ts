import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const getReelsFeed = async (req: Request, res: Response) => {
  try {
    const userGender = req.user!.gender;
    const limit = parseInt(req.query.limit as string) || 5; // Reels are loaded in small batches
    const cursor = req.query.cursor as string;

    const reels = await (prisma.post as any).findManySameGender(userGender, {
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      where: {
        mediaType: 'REEL',
        visibility: 'PUBLIC'
      },
      orderBy: { createdAt: 'desc' }, // For MVP, chronological. Could randomize.
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { reactions: true, comments: true } },
        reactions: { where: { userId: req.user!.userId } },
        savedBy: { where: { userId: req.user!.userId } }
      }
    }, req.user!.blockedIds || []);

    const mappedReels = reels.slice(0, limit).map((r: any) => ({
      ...r,
      myReaction: r.reactions?.[0] || null,
      isSaved: r.savedBy?.length > 0,
    }));

    let nextCursor = undefined;
    if (reels.length > limit) {
      nextCursor = reels.pop()!.id;
    }

    res.json({ success: true, data: mappedReels, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
