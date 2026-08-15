import { Request, Response, NextFunction } from 'express';
import { prisma } from '@socialplatform/prisma';
import { verifyGenderAccess } from '../services/access.service';
import { ForbiddenError } from '../utils/errors';

export type ResourceType = 'user' | 'post' | 'group' | 'comment' | 'message';

export const requireSameGender = (resourceType: ResourceType, paramName: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterGender = req.user?.gender;
      if (!requesterGender) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const resourceId = req.params[paramName];
      if (!resourceId) {
        return res.status(400).json({ success: false, error: 'Resource ID missing' });
      }

      let targetGender: string | undefined | null;

      switch (resourceType) {
        case 'user': {
          const user = await prisma.user.findUnique({ where: { id: resourceId }, select: { gender: true } });
          targetGender = user?.gender;
          break;
        }
        case 'post': {
          const post = await prisma.post.findUnique({ where: { id: resourceId }, select: { author: { select: { gender: true } } } });
          targetGender = post?.author?.gender;
          break;
        }
        case 'group': {
          const group = await prisma.group.findUnique({ where: { id: resourceId }, select: { gender: true } });
          targetGender = group?.gender;
          break;
        }
        case 'comment': {
          const comment = await prisma.comment.findUnique({ where: { id: resourceId }, select: { author: { select: { gender: true } } } });
          targetGender = comment?.author?.gender;
          break;
        }
        default:
          return res.status(500).json({ success: false, error: 'Unknown resource type for gender validation' });
      }

      if (!targetGender) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      verifyGenderAccess(requesterGender, targetGender);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(error.status).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Internal server error during gender validation' });
    }
  };
};
