import { apiClient } from './client';
import type { Comment, CreateCommentRequest, UpdateCommentRequest, MessageResponse } from '../types';

export const commentsApi = {
  create: (data: CreateCommentRequest): Promise<Comment> =>
    apiClient.post('/comments', data).then((r) => r.data),

  getByPost: (postId: string): Promise<Comment[]> =>
    apiClient.get(`/comments/post/${postId}`).then((r) => r.data),

  update: (id: string, data: UpdateCommentRequest): Promise<Comment> =>
    apiClient.put(`/comments/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<MessageResponse> =>
    apiClient.delete(`/comments/${id}`).then((r) => r.data),
};
