import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().max(5000).optional(),
  mediaUrls: z.array(z.string().url()).max(10).default([]),
  mediaType: z.enum(['TEXT', 'IMAGE', 'CAROUSEL', 'VIDEO', 'REEL']),
  feeling: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  visibility: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).default('PUBLIC'),
});

export const reactSchema = z.object({
  type: z.enum(['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY']),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().cuid().optional(),
});

export const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  caption: z.string().max(500).optional(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
  coverPhotoUrl: z.string().url().optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
  coverPhotoUrl: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
});

export const reportSchema = z.object({
  targetId: z.string().cuid(),
  targetType: z.enum(['POST', 'COMMENT', 'USER', 'MESSAGE']),
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'users', 'hashtags', 'groups']).default('all'),
});

export const onboardingSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric with underscores only'),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 13;
  }, { message: 'Must be at least 13 years old' }),
});
