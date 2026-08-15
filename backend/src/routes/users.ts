import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, optionalAuthenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

import { verifyGenderAccess } from '../lib/gender';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

router.get('/:id', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.userId;
    const requestedUserId = req.params.id;

    if (currentUserId && currentUserId !== requestedUserId) {
      const genderCheck = await verifyGenderAccess(currentUserId, requestedUserId);
      if (!genderCheck.allowed) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== requestedUserId) {
      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: requestedUserId,
          },
        },
      });
      isFollowing = !!follow;
    }

    res.json({
      user: {
        ...user,
        isFollowing: currentUserId ? isFollowing : undefined,
        isOwnProfile: currentUserId === requestedUserId,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    if ('gender' in data) {
      return res.status(403).json({ error: 'Gender cannot be changed' });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search/:query', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const query = req.params.query;
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { gender: true },
    });

    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          { gender: currentUser.gender },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
      },
      take: 20,
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

