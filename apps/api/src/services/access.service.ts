import { ForbiddenError } from '../utils/errors';

export const verifyGenderAccess = (requesterGender: string, targetGender: string) => {
  if (requesterGender !== targetGender) {
    throw new ForbiddenError('Access denied: You cannot interact with this content due to gender restrictions.');
  }
  return true;
};
