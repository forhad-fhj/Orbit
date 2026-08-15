import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getNotifications, markAsRead, getUnreadCount } from '../controllers/notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/read', markAsRead);

export default router;
