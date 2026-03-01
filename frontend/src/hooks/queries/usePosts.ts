import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts.api';
import { parseApiError } from '../../api/errors';
import { queryKeys } from '../queryKeys';
import type {
  GetPostsQuery,
  CreatePostRequest,
  UpdatePostRequest,
  VerifyOwnershipRequest,
} from '../../types';

export function usePostsQuery(params?: GetPostsQuery) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => postsApi.getAll(params),
  });
}

export function usePostDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled: !!id,
  });
}

export function useVerificationCodeQuery(id: string, username: string) {
  return useQuery({
    queryKey: queryKeys.posts.verificationCode(id, username),
    queryFn: () => postsApi.getVerificationCode(id, username),
    enabled: !!id && !!username,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useCreatePostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
    onError: (error) => parseApiError(error),
  });
}

export function useUpdatePostMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePostRequest) => postsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => parseApiError(error),
  });
}

export function useResolvePostMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => postsApi.resolve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => parseApiError(error),
  });
}

export function useDeletePostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
    onError: (error) => parseApiError(error),
  });
}

export function useVerifyOwnershipMutation(id: string) {
  return useMutation({
    mutationFn: (data: VerifyOwnershipRequest) => postsApi.verifyOwnershipCode(id, data),
    onError: (error) => parseApiError(error),
  });
}
