import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';
import { Prisma } from '@socialplatform/prisma';

export const getHomeFeed = async (req: Request, res: Response) => {
  try {
    const userGender = req.user!.gender;
    const limit = parseInt(req.query.limit as string) || 10;
    // For raw query with computed ranking, offset pagination is much more stable than multi-column cursors.
    // We will use page-based offset, but format the response with 'nextCursor' to remain compatible with React Query's InfiniteQuery.
    const page = parseInt(req.query.cursor as string) || 0;
    const offset = page * limit;

    // Using raw query to rank by recency + engagement score (likes + comments weighted)
    // AND strictly enforcing the gender barrier on the join.
    const blockedIds = req.user!.blockedIds || [];
    const blockedCondition = blockedIds.length > 0 
      ? Prisma.sql`AND p."authorId" NOT IN (${Prisma.join(blockedIds)})`
      : Prisma.empty;
    const posts: any[] = await prisma.$queryRaw`
      SELECT 
        p.*, 
        u.username as "authorUsername", 
        u."avatarUrl" as "authorAvatarUrl",
        (
          COALESCE((SELECT COUNT(*) FROM "Reaction" r WHERE r."postId" = p.id), 0) * 2 + 
          COALESCE((SELECT COUNT(*) FROM "Comment" c WHERE c."postId" = p.id), 0)
        ) as "engagementScore"
      FROM "Post" p
      INNER JOIN "User" u ON p."authorId" = u.id
      WHERE u.gender = CAST(${userGender} AS "Gender")
      AND p.visibility IN ('PUBLIC', 'FRIENDS')
      ${blockedCondition}
      ORDER BY p."createdAt" DESC, "engagementScore" DESC
      LIMIT ${limit + 1} OFFSET ${offset};
    `;

    // Fetch comments and reactions for these posts to hydrate the UI
    const postIds = posts.map(p => p.id);
    
    // Using findManySameGender to hydrate relations just in case, though the raw query already filtered gender
    const hydration = await (prisma.post as any).findManySameGender(userGender, {
      where: { id: { in: postIds } },
      include: {
        _count: { select: { reactions: true, comments: true } },
        reactions: { where: { userId: req.user!.userId } }, // did I react?
        savedBy: { where: { userId: req.user!.userId } } // did I save?
      }
    }, blockedIds);

    const hydMap = new Map<string, any>(hydration.map((h: any) => [h.id, h]));

    const mergedPosts = posts.slice(0, limit).map(p => ({
      ...p,
      author: {
        username: p.authorUsername,
        avatarUrl: p.authorAvatarUrl,
      },
      _count: hydMap.get(p.id)?._count,
      myReaction: hydMap.get(p.id)?.reactions?.[0] || null,
      isSaved: (hydMap.get(p.id)?.savedBy?.length || 0) > 0,
    }));

    let nextCursor = undefined;
    if (posts.length > limit) {
      nextCursor = (page + 1).toString();
    }

    res.json({ success: true, data: mergedPosts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getExploreFeed = async (req: Request, res: Response) => {
  try {
    const userGender = req.user!.gender;
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string;

    // Standard Prisma extension enforcement
    const posts = await (prisma.post as any).findManySameGender(userGender, {
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      where: { visibility: 'PUBLIC', mediaType: { in: ['IMAGE', 'CAROUSEL', 'VIDEO'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { reactions: true, comments: true } }
      }
    }, req.user!.blockedIds || []);

    let nextCursor = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    res.json({ success: true, data: posts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getHashtagFeed = async (req: Request, res: Response) => {
  try {
    const userGender = req.user!.gender;
    const tag = (req.params.tag || '').toLowerCase();
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;

    const posts = await (prisma.post as any).findManySameGender(userGender, {
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      where: {
        hashtags: { some: { hashtag: { tag } } },
        visibility: 'PUBLIC'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { reactions: true, comments: true } },
        reactions: { where: { userId: req.user!.userId } },
        savedBy: { where: { userId: req.user!.userId } }
      }
    }, req.user!.blockedIds || []);

    const mappedPosts = posts.slice(0, limit).map((p: any) => ({
      ...p,
      myReaction: p.reactions?.[0] || null,
      isSaved: p.savedBy?.length > 0,
    }));

    let nextCursor = undefined;
    if (posts.length > limit) {
      nextCursor = posts.pop()!.id;
    }

    res.json({ success: true, data: mappedPosts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getSavedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // We only fetch posts saved by the user, and because they couldn't have saved an opposite gender's post (due to requireSameGender on save), it's safe. 
    // But let's use findManySameGender anyway to guarantee mathematically.
    const userGender = req.user!.gender;

    const savedRecords = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { username: true, avatarUrl: true, gender: true } },
            _count: { select: { reactions: true, comments: true } },
            reactions: { where: { userId: req.user!.userId } },
            savedBy: { where: { userId: req.user!.userId } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Enforce gender manually since it's a nested include
    const validPosts = savedRecords
      .map((record: any) => record.post)
      .filter((p: any) => p.author.gender === userGender)
      .map((p: any) => ({
        ...p,
        myReaction: p.reactions?.[0] || null,
        isSaved: p.savedBy?.length > 0,
      }));

    res.json({ success: true, data: validPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
