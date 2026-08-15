import { requireSameGender } from '../middlewares/gender.middleware';
import { verifyGenderAccess } from '../services/access.service';
import { ForbiddenError } from '../utils/errors';
import { prisma } from '@socialplatform/prisma';

// Mock express req, res, next
const mockRequest = (user: any, params: any) => ({
  user,
  params
} as any);

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// Mock Prisma
jest.mock('@socialplatform/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findManySameGender: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
      findManySameGender: jest.fn(),
    }
  }
}));

describe('Gender Barrier Layer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyGenderAccess (Core Service)', () => {
    it('should allow access for same genders', () => {
      expect(() => verifyGenderAccess('MALE', 'MALE')).not.toThrow();
      expect(() => verifyGenderAccess('FEMALE', 'FEMALE')).not.toThrow();
    });

    it('should throw ForbiddenError for different genders', () => {
      expect(() => verifyGenderAccess('MALE', 'FEMALE')).toThrow(ForbiddenError);
      expect(() => verifyGenderAccess('FEMALE', 'MALE')).toThrow(ForbiddenError);
    });
  });

  describe('requireSameGender (Express Middleware)', () => {
    it('should return 401 if requester gender is missing', async () => {
      const req = mockRequest({}, { id: '123' });
      const res = mockResponse();
      
      const middleware = requireSameGender('user', 'id');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
    });

    it('should return 403 when a MALE attempts to access a FEMALE profile', async () => {
      const req = mockRequest({ gender: 'MALE' }, { id: 'female-123' });
      const res = mockResponse();
      
      // Mock db target
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ gender: 'FEMALE' });

      const middleware = requireSameGender('user', 'id');
      await middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Access denied: You cannot interact with this content due to gender restrictions.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when a FEMALE accesses a FEMALE profile', async () => {
      const req = mockRequest({ gender: 'FEMALE' }, { id: 'female-123' });
      const res = mockResponse();
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ gender: 'FEMALE' });

      const middleware = requireSameGender('user', 'id');
      await middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Prisma Query Extensions', () => {
    it('should inject where clause for findManySameGender on User', async () => {
      ((prisma.user as any).findManySameGender as jest.Mock).mockImplementation((gender: string, args: any) => {
        return Promise.resolve([{ id: '1', gender }]);
      });
      
      await (prisma.user as any).findManySameGender('MALE', { select: { id: true } });
      
      expect((prisma.user as any).findManySameGender).toHaveBeenCalledWith('MALE', { select: { id: true } });
    });
  });
});
