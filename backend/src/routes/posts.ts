import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, optionalAuthenticateToken, AuthRequest } from '../middleware/auth';
import { getUserGender, verifyGenderAccess } from '../lib/gender';

const router = express.Router();

const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  mediaUrl: z.string().url().optional().nullable(),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'NONE']).default('NONE'),
});

// Create post
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createPostSchema.parse(req.body);

    const post = await prisma.post.create({
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(201).json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;
    const userId = req.userId!;

    const userGender = await getUserGender(userId);
    if (!userGender) {
      return res.status(401).json({ error: 'User not found' });
    }

    const whereClause = {
      author: {
        gender: userGender,
      },
    };

    const total = await prisma.post.count({ where: whereClause });

    const posts = await prisma.post.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // Format response with like status
    const formattedPosts = posts.map((post: any) => {
      const { likes, ...postWithoutLikes } = post;
      return {
        ...postWithoutLikes,
        liked: userId ? (post.likes && post.likes.length > 0) : false,
      };
    });

    res.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            gender: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const genderCheck = await verifyGenderAccess(req.userId!, post.author.id);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.post.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const genderCheck = await verifyGenderAccess(req.userId!, req.params.userId);
    if (!genderCheck.allowed) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

