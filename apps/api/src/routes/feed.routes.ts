import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  getHomeFeed,
  getExploreFeed,
  getHashtagFeed,
  getSavedPosts
} from '../controllers/feed.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getHomeFeed);
router.get('/explore', getExploreFeed);
router.get('/saved', getSavedPosts);
router.get('/hashtag/:tag', getHashtagFeed);

export default router;
