import { apiClient } from './client';
import type {
  UserProfile,
  UpdateUserRequest,
  ChangePasswordRequest,
  PostSummary,
  GetPostsQuery,
  PaginatedResponse,
  MessageResponse,
} from '../types';

export const usersApi = {
  getByUsername: (username: string): Promise<UserProfile> =>
    apiClient.get(`/users/${username}`).then((r) => r.data),

  getPosts: (username: string, params?: GetPostsQuery): Promise<PaginatedResponse<PostSummary>> =>
    apiClient.get(`/users/${username}/posts`, { params }).then((r) => r.data),

  update: (username: string, data: UpdateUserRequest): Promise<UserProfile> =>
    apiClient.put(`/users/${username}`, data).then((r) => r.data),

  changePassword: (username: string, data: ChangePasswordRequest): Promise<MessageResponse> =>
    apiClient.put(`/users/${username}/password`, data).then((r) => r.data),

  delete: (username: string): Promise<MessageResponse> =>
    apiClient.delete(`/users/${username}`).then((r) => r.data),
};
