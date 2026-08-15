import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireSameGender } from '../middlewares/gender.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createGroupSchema } from '../utils/validation';
import {
  createGroup,
  joinGroup,
  leaveGroup,
  getGroups
} from '../controllers/group.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getGroups);
router.post('/', validate(createGroupSchema), createGroup);
router.post('/:id/join', requireSameGender('group'), joinGroup);
router.post('/:id/leave', leaveGroup);

export default router;

