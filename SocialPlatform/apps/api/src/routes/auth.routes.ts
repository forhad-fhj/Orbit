import { Router } from 'express';
import { googleLogin, completeOnboarding, me, logout } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/google', googleLogin);
router.post('/onboarding', completeOnboarding);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

export default router;
