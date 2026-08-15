import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';
import { checkContent } from '../utils/moderation';

export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, mediaUrls, mediaType, feeling, location, visibility } = req.body;
    const authorId = req.user!.userId;

    if (content) {
      const check = checkContent(content);
      if (!check.isClean) {
        return res.status(400).json({ success: false, error: check.reason, flaggedWords: check.flaggedWords });
      }
    }

    const hashtags = content ? Array.from(new Set(content.match(/#[\w]+/g) || [])).map((tag: string) => tag.toLowerCase()) : [];

    const post = await prisma.post.create({
      data: {
        authorId,
        content,
        mediaUrls,
        mediaType,
        feeling,
        location,
        visibility,
        hashtags: {
          create: hashtags.map((tag) => ({
            hashtag: {
              connectOrCreate: {
                where: { tag },
                create: { tag },
              },
            },
          })),
        },
      },
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const reactToPost = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const { type } = req.body; // type corresponds to ReactionType enum
    const userId = req.user!.userId;

    const existingReaction = await prisma.reaction.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off
        await prisma.reaction.delete({ where: { id: existingReaction.id } });
      } else {
        // Update type
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
      }
    } else {
      // Create new
      await prisma.reaction.create({
        data: {
          type,
          postId,
          userId,
        },
      });
    }

    // Get aggregated counts
    const counts = await prisma.reaction.groupBy({
      by: ['type'],
      where: { postId },
      _count: { _all: true },
    });

    res.json({ success: true, data: counts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const { content, parentCommentId } = req.body;
    const authorId = req.user!.userId;

    const check = checkContent(content);
    if (!check.isClean) {
      return res.status(400).json({ success: false, error: check.reason, flaggedWords: check.flaggedWords });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        content,
        parentCommentId,
      },
      include: {
        author: { select: { username: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string;

    const comments = await prisma.comment.findMany({
      where: { postId, parentCommentId: null }, // Top level
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        replies: {
          take: 3, // preview a few replies
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { username: true, avatarUrl: true } } }
        },
        _count: { select: { replies: true, reactions: true } }
      },
    });

    let nextCursor: string | undefined = undefined;
    if (comments.length > limit) {
      const nextItem = comments.pop();
      nextCursor = nextItem!.id;
    }

    res.json({ success: true, data: comments, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const savePost = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user!.userId;

    await prisma.savedPost.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });

    res.json({ success: true, message: 'Post saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const unsavePost = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user!.userId;

    await prisma.savedPost.delete({
      where: { userId_postId: { userId, postId } },
    });

    res.json({ success: true, message: 'Post unsaved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
