import { Request, Response } from 'express';
import { prisma } from '@socialplatform/prisma';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const blockedIds = req.user!.blockedIds || [];

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, username: true, avatarUrl: true, gender: true } }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: { select: { id: true, username: true } }
              }
            }
          }
        }
      }
    });

    const conversations = participations
      .map((p: any) => {
        const otherParticipants = p.conversation.participants
          .filter((part: any) => part.userId !== userId)
          .filter((part: any) => !blockedIds.includes(part.userId));

        if (otherParticipants.length === 0 && !p.conversation.isGroup) return null;

        const lastMessage = p.conversation.messages[0] || null;
        return {
          id: p.conversation.id,
          isGroup: p.conversation.isGroup,
          participants: otherParticipants.map((part: any) => part.user),
          lastMessage,
          createdAt: p.conversation.createdAt
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 30;
    const cursor = req.query.cursor as string;

    const isMember = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } }
    });

    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Not a member of this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    let nextCursor: string | undefined;
    if (messages.length > limit) {
      nextCursor = messages.pop()!.id;
    }

    res.json({ success: true, data: messages.reverse(), nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
