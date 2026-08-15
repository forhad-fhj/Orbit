import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { verifyGenderAccess } from '../lib/gender';

const router = express.Router();

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(500),
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createCommentSchema.parse(req.body);

    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      include: { author: { select: { id: true } } },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const genderCheck = await verifyGenderAccess(req.userId!, post.author.id);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = await prisma.comment.create({
      data: {
        ...data,
        authorId: req.userId!,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({ comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/post/:postId', authenticateToken, async (req: AuthRequest, res) => {
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

    const comments = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.comment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

