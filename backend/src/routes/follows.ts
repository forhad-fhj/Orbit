import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { verifyGenderAccess } from '../lib/gender';

const router = express.Router();

router.post('/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const genderCheck = await verifyGenderAccess(req.userId!, req.params.userId);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId!,
          followingId: req.params.userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const follow = await prisma.follows.create({
      data: {
        followerId: req.userId!,
        followingId: req.params.userId,
      },
    });

    res.status(201).json({ follow });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: req.userId!,
          followingId: req.params.userId,
        },
      },
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if following a user
router.get('/:userId/check', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
        followerId: req.userId!,
        followingId: req.params.userId,
        },
      },
    });

    res.json({ following: !!follow });
  } catch (error) {
    console.error('Check follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId/followers', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const genderCheck = await verifyGenderAccess(req.userId!, req.params.userId);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const followers = await prisma.follows.findMany({
      where: { followingId: req.params.userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    res.json({ followers: followers.map(f => f.follower) });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId/following', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const genderCheck = await verifyGenderAccess(req.userId!, req.params.userId);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const following = await prisma.follows.findMany({
      where: { followerId: req.params.userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    res.json({ following: following.map(f => f.following) });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

