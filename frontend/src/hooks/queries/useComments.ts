import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../../api/comments.api';
import { parseApiError } from '../../api/errors';
import { queryKeys } from '../queryKeys';
import type { CreateCommentRequest, UpdateCommentRequest } from '../../types';

export function useCommentsQuery(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: () => commentsApi.getByPost(postId),
    enabled: !!postId,
  });
}

export function useCreateCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.create(data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(vars.postId) }),
    onError: (error) => parseApiError(error),
  });
}

export function useUpdateCommentMutation(id: string, postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCommentRequest) => commentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) }),
    onError: (error) => parseApiError(error),
  });
}

export function useDeleteCommentMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) }),
    onError: (error) => parseApiError(error),
  });
}
