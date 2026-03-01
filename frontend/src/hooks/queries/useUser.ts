import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users.api';
import { parseApiError } from '../../api/errors';
import { queryKeys } from '../queryKeys';
import type { UpdateUserRequest, ChangePasswordRequest, GetPostsQuery } from '../../types';

export function useUserProfileQuery(username: string) {
  return useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => usersApi.getByUsername(username),
    enabled: !!username,
  });
}

export function useUserPostsQuery(username: string, params?: GetPostsQuery) {
  return useQuery({
    queryKey: queryKeys.users.posts(username, params),
    queryFn: () => usersApi.getPosts(username, params),
    enabled: !!username,
  });
}

export function useUpdateUserMutation(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserRequest) => usersApi.update(username, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.profile(username) }),
    onError: (error) => parseApiError(error),
  });
}

export function useChangePasswordMutation(username: string) {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => usersApi.changePassword(username, data),
    onError: (error) => parseApiError(error),
  });
}

export function useDeleteUserMutation(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersApi.delete(username),
    onSuccess: () => qc.removeQueries({ queryKey: queryKeys.users.profile(username) }),
    onError: (error) => parseApiError(error),
  });
}
