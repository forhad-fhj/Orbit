import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const createStory = async (req: Request, res: Response) => {
  try {
    const { mediaUrl, mediaType, caption } = req.body;
    const authorId = req.user!.userId;
    
    // Auto-expiry exactly 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        authorId,
        mediaUrl,
        mediaType,
        caption,
        expiresAt,
      },
    });

    res.status(201).json({ success: true, data: story });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getStoryFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userGender = req.user!.gender;

    // Fetch stories from followed users and self, strictly matching gender, and not expired
    // Instead of complex join, findManySameGender is perfect here. 
    // We get all valid stories and group them by author in JS.
    const validStories = await (prisma.story as any).findManySameGender(userGender, {
      where: {
        expiresAt: { gt: new Date() },
        OR: [
          { authorId: userId }, // my own stories
          { author: { followers: { some: { followerId: userId, status: 'ACCEPTED' } } } } // followed users
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } }
      }
    }, req.user!.blockedIds || []);

    // Group stories by author
    const grouped = validStories.reduce((acc: any, story: any) => {
      const authorId = story.author.id;
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: []
        };
      }
      acc[authorId].stories.push(story);
      return acc;
    }, {});

    // Convert to array and put the current user first if they have stories
    const result = Object.values(grouped);
    result.sort((a: any, b: any) => {
      if (a.author.id === userId) return -1;
      if (b.author.id === userId) return 1;
      return 0;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const viewStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Simple increment
    await prisma.story.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
