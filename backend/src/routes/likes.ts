import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { verifyGenderAccess } from '../lib/gender';

const router = express.Router();

router.post('/:postId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId },
      include: { author: { select: { id: true } } },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const genderCheck = await verifyGenderAccess(req.userId!, post.author.id);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.postId,
          userId: req.userId!,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    const like = await prisma.like.create({
      data: {
        postId: req.params.postId,
        userId: req.userId!,
      },
    });

    res.status(201).json({ like });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlike a post
router.delete('/:postId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: req.params.postId,
          userId: req.userId!,
        },
      },
    });

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user liked a post
router.get('/:postId/check', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.postId,
          userId: req.userId!,
        },
      },
    });

    res.json({ liked: !!like });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

