import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { reportSchema } from '../utils/validation';
import {
  blockUser,
  unblockUser,
  reportEntity,
} from '../controllers/moderation.controller';

const router = Router();

router.use(requireAuth);

router.post('/block/:id', blockUser);
router.delete('/block/:id', unblockUser);
router.post('/report', validate(reportSchema), reportEntity);

export default router;

