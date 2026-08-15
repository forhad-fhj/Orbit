import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const followUser = async (req: Request, res: Response) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user!.userId;
    const blockedIds = req.user!.blockedIds || [];

    if (followerId === followingId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    if (blockedIds.includes(followingId)) {
      return res.status(403).json({ success: false, error: 'Cannot interact with this user' });
    }

    // The requireSameGender('user') middleware handles gender check globally on the route.
    // Fetch the target user to see if they are private
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { isPrivate: true }
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const status = targetUser.isPrivate ? 'PENDING' : 'ACCEPTED';

    const follow = await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId, status },
      update: { status },
    });

    res.json({ success: true, data: follow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const acceptFollow = async (req: Request, res: Response) => {
  try {
    const { id: followerId } = req.params;
    const followingId = req.user!.userId; // We are the one being followed

    const follow = await prisma.follow.update({
      where: { followerId_followingId: { followerId, followingId } },
      data: { status: 'ACCEPTED' }
    });

    res.json({ success: true, data: follow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { id: targetId } = req.params;
    const userId = req.user!.userId;

    // Could be rejecting a follow request OR unfollowing someone
    // Check if we are unfollowing (userId = followerId) or rejecting/removing a follower (userId = followingId)
    // For simplicity, let's just delete any relation between these two
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId, followingId: targetId },
          { followerId: targetId, followingId: userId }
        ]
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const blockedIds = req.user!.blockedIds || [];

    const requests = await prisma.follow.findMany({
      where: {
        followingId: userId,
        status: 'PENDING',
        followerId: { notIn: blockedIds }
      },
      include: {
        follower: {
          select: { id: true, username: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
