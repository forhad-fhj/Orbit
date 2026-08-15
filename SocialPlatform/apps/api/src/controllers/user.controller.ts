import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const userGender = req.user!.gender;
    const blockedIds = req.user!.blockedIds || [];

    const user = await (prisma.user as any).findFirstSameGender(userGender, {
      where: { username },
      include: {
        _count: { select: { followers: true, following: true, posts: true } },
        followers: { where: { followerId: req.user!.userId } }, // to check if we follow them
      }
    }, blockedIds);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isFollowing = user.followers.length > 0 && user.followers[0].status === 'ACCEPTED';
    const isPending = user.followers.length > 0 && user.followers[0].status === 'PENDING';

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        coverPhotoUrl: user.coverPhotoUrl,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
        _count: user._count,
        isFollowing,
        isPending,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { bio, location, avatarUrl, coverPhotoUrl, isPrivate, displayName } = req.body;
    const userId = req.user!.userId;

    // Do NOT allow updating gender here. The schema/extension prevents it anyway.
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        bio,
        location,
        avatarUrl,
        coverPhotoUrl,
        isPrivate,
        displayName,
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
