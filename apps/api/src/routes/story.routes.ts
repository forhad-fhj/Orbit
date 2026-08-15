import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createStorySchema } from '../utils/validation';
import {
  createStory,
  getStoryFeed,
  viewStory,
} from '../controllers/story.controller';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createStorySchema), createStory);
router.get('/feed', getStoryFeed);
router.post('/:id/view', viewStory);

export default router;

