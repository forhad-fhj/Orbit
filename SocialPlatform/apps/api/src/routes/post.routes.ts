import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireSameGender } from '../middlewares/gender.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPostSchema, reactSchema, createCommentSchema } from '../utils/validation';
import {
  createPost,
  reactToPost,
  createComment,
  getComments,
  savePost,
  unsavePost
} from '../controllers/post.controller';

const postLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, error: 'Too many posts. Try again later.' } });
const commentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { success: false, error: 'Too many comments. Try again later.' } });

const router = Router();

router.use(requireAuth);

router.post('/', postLimiter, validate(createPostSchema), createPost);

router.post('/:id/react', requireSameGender('post'), validate(reactSchema), reactToPost);
router.post('/:id/comments', requireSameGender('post'), commentLimiter, validate(createCommentSchema), createComment);
router.get('/:id/comments', requireSameGender('post'), getComments);
router.post('/:id/save', requireSameGender('post'), savePost);
router.delete('/:id/save', requireSameGender('post'), unsavePost);

export default router;

