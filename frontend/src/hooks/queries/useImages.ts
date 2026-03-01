import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '../../api/images.api';
import { parseApiError } from '../../api/errors';
import { queryKeys } from '../queryKeys';
import type { UploadImageParams } from '../../types';

export function useImagesQuery(postId: string) {
  return useQuery({
    queryKey: queryKeys.images.byPost(postId),
    queryFn: () => imagesApi.getByPost(postId),
    enabled: !!postId,
  });
}

export function useUploadImageMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: UploadImageParams) => imagesApi.upload(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.images.byPost(postId) }),
    onError: (error) => parseApiError(error),
  });
}

export function useSetPrimaryImageMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imagesApi.setPrimary(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.images.byPost(postId) }),
    onError: (error) => parseApiError(error),
  });
}

export function useDeleteImageMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imagesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.images.byPost(postId) }),
    onError: (error) => parseApiError(error),
  });
}
