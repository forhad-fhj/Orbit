import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireSameGender } from '../middlewares/gender.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../utils/validation';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

router.use(requireAuth);

router.put('/me', validate(updateProfileSchema), updateProfile);
router.get('/:username', getProfile);

export default router;

