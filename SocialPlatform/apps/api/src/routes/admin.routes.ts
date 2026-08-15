import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { getAnalytics, suspendUser, resolveReport } from '../controllers/admin.controller';
import { getReports } from '../controllers/moderation.controller';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/reports', getReports);
router.post('/reports/:id/resolve', resolveReport);
router.post('/users/:id/suspend', suspendUser);

export default router;
