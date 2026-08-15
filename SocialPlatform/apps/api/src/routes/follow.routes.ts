import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireSameGender } from '../middlewares/gender.middleware';
import {
  followUser,
  acceptFollow,
  unfollowUser,
  getPendingRequests
} from '../controllers/follow.controller';

const router = Router();

router.use(requireAuth);

router.get('/pending', getPendingRequests);
router.post('/:id', requireSameGender('user'), followUser);
router.post('/:id/accept', acceptFollow); // the person accepting is the target
router.delete('/:id', unfollowUser);

export default router;
