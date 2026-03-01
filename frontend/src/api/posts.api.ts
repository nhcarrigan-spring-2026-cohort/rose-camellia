import { apiClient } from './client';
import type {
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  GetPostsQuery,
  PaginatedResponse,
  PostSummary,
  PostDetail,
  VerificationCodeResponse,
  VerifyOwnershipRequest,
  VerifyOwnershipResponse,
  MessageResponse,
} from '../types';

export const postsApi = {
  create: (data: CreatePostRequest): Promise<CreatePostResponse> =>
    apiClient.post('/posts', data).then((r) => r.data),

  getAll: (params?: GetPostsQuery): Promise<PaginatedResponse<PostSummary>> =>
    apiClient.get('/posts', { params }).then((r) => r.data),

  getById: (id: string): Promise<PostDetail> =>
    apiClient.get(`/posts/${id}`).then((r) => r.data),

  getVerificationCode: (id: string, username: string): Promise<VerificationCodeResponse> =>
    apiClient.get(`/posts/${id}/verification-code`, { params: { username } }).then((r) => r.data),

  verifyOwnershipCode: (id: string, data: VerifyOwnershipRequest): Promise<VerifyOwnershipResponse> =>
    apiClient.post(`/posts/${id}/verify`, data).then((r) => r.data),

  update: (id: string, data: UpdatePostRequest): Promise<PostDetail> =>
    apiClient.put(`/posts/${id}`, data).then((r) => r.data),

  resolve: (id: string): Promise<PostDetail> =>
    apiClient.patch(`/posts/${id}/resolve`).then((r) => r.data),

  delete: (id: string): Promise<MessageResponse> =>
    apiClient.delete(`/posts/${id}`).then((r) => r.data),
};
