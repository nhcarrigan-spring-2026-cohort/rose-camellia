import type { PostSummary } from './post.types';

export interface UserProfile {
  username: string;
  name: string;
  email: string;
  contactNumber?: string;
  createdAt: string;
  verified: boolean;
  isGuest: boolean;
  Post: PostSummary[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  contactNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
