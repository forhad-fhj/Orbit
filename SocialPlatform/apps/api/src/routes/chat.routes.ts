import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getConversations, getMessages } from '../controllers/chat.controller';

const router = Router();

router.use(requireAuth);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);

export default router;
