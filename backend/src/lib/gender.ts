import { prisma } from './prisma';
import { Gender } from '@prisma/client';

export async function verifyGenderAccess(
  requesterId: string,
  targetId: string
): Promise<{ allowed: boolean; requesterGender?: Gender; targetGender?: Gender }> {
  if (requesterId === targetId) {
    return { allowed: true };
  }

  const [requester, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: requesterId },
      select: { gender: true },
    }),
    prisma.user.findUnique({
      where: { id: targetId },
      select: { gender: true },
    }),
  ]);

  if (!requester || !target) {
    return { allowed: false, requesterGender: requester?.gender, targetGender: target?.gender };
  }

  const allowed = requester.gender === target.gender;

  return {
    allowed,
    requesterGender: requester.gender,
    targetGender: target.gender,
  };
}

export async function getUserGender(userId: string): Promise<Gender | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { gender: true },
  });

  return user?.gender || null;
}
