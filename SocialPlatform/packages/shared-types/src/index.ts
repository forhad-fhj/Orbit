export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  gender: 'MALE' | 'FEMALE';
  avatarUrl?: string;
  createdAt: Date;
}

export interface GoogleAuthResponse {
  isPending: boolean;
  user?: UserDTO;
  message?: string;
}

export interface OnboardingPayload {
  username: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
}

export interface PendingAuthPayload {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthJWTPayload {
  userId: string;
  role: string;
  gender: string;
  blockedIds?: string[];
}
