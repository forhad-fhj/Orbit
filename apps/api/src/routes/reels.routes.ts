import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getReelsFeed } from '../controllers/reels.controller';

const router = Router();

router.use(requireAuth);

router.get('/feed', getReelsFeed);

export default router;
