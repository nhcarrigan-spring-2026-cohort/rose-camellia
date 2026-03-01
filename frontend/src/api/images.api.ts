import { apiClient } from './client';
import type { PostImage, UploadImageParams, MessageResponse } from '../types';

export const imagesApi = {
  upload: ({ image, postId, isPrimary }: UploadImageParams): Promise<PostImage> => {
    const form = new FormData();
    form.append('image', image);
    form.append('postId', postId);
    if (isPrimary !== undefined) form.append('isPrimary', String(isPrimary));
    return apiClient.post('/images', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },

  getByPost: (postId: string): Promise<PostImage[]> =>
    apiClient.get(`/images/post/${postId}`).then((r) => r.data),

  setPrimary: (id: string): Promise<PostImage> =>
    apiClient.patch(`/images/${id}/primary`).then((r) => r.data),

  delete: (id: string): Promise<MessageResponse> =>
    apiClient.delete(`/images/${id}`).then((r) => r.data),
};
