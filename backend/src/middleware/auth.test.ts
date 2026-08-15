/**
 * Authentication middleware test utilities
 * This file can be used to test the authentication middleware
 */

import jwt from 'jsonwebtoken';

/**
 * Generate a test JWT token for testing purposes
 */
export function generateTestToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

/**
 * Verify a token (for testing)
 */
export function verifyTestToken(token: string): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'test-secret';
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

