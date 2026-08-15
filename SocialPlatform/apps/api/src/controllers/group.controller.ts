import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, isPrivate, coverPhotoUrl } = req.body;
    const userId = req.user!.userId;
    const userGender = req.user!.gender as 'MALE' | 'FEMALE';

    const group = await prisma.group.create({
      data: {
        name,
        description,
        isPrivate,
        coverPhotoUrl,
        gender: userGender, // Locks group to creator's gender
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      }
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user!.userId;
    
    // requireSameGender('group') handles gender block globally.
    
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId, role: 'MEMBER' },
      update: {}
    });

    res.json({ success: true, message: 'Joined group' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user!.userId;

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } }
    });

    res.json({ success: true, message: 'Left group' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const userGender = req.user!.gender as 'MALE' | 'FEMALE';
    const limit = parseInt(req.query.limit as string) || 20;

    // Use Prisma extension to fetch same-gender groups
    const groups = await (prisma.group as any).findManySameGender(userGender, {
      take: limit,
      where: { isPrivate: false }, // Only list public groups in directory
      include: {
        _count: { select: { members: true } },
        members: { where: { userId: req.user!.userId } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = groups.map((g: any) => ({
      ...g,
      isMember: g.members.length > 0
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
