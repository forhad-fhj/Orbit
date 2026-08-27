import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { id: blockedId } = req.params;
    const blockerId = req.user!.userId;

    if (blockerId === blockedId) {
      return res.status(400).json({ success: false, error: 'Cannot block yourself' });
    }

    // Also remove any follows just in case
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId }
        ]
      }
    });

    const block = await prisma.block.create({
      data: {
        blockerId,
        blockedId
      }
    });

    res.status(201).json({ success: true, data: block });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { id: blockedId } = req.params;
    const blockerId = req.user!.userId;

    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId, blockedId } }
    });

    res.json({ success: true, message: 'Unblocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const reportEntity = async (req: Request, res: Response) => {
  try {
    const reporterId = req.user!.userId;
    const { targetId, targetType, reason, details } = req.body;
    // targetType: USER, POST, COMMENT, GROUP

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetId,
        targetType,
        reason
      }
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const role = req.user!.role;
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
