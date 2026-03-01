import type { GetPostsQuery } from '../types';

export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (params?: GetPostsQuery) => ['posts', 'list', params] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    verificationCode: (id: string, username: string) => ['posts', 'verification-code', id, username] as const,
  },
  comments: {
    byPost: (postId: string) => ['comments', 'post', postId] as const,
  },
  images: {
    byPost: (postId: string) => ['images', 'post', postId] as const,
  },
  users: {
    profile: (username: string) => ['users', 'profile', username] as const,
    posts: (username: string, params?: GetPostsQuery) => ['users', 'posts', username, params] as const,
  },
} as const;
