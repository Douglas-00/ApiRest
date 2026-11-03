"use client";

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import type { UpdateMeInput } from "./types";

export const keys = { me: ["me"] as const, files: ["files"] as const, users: ["users"] as const };

/** 401 = sessão ausente, não é erro. */
export const meQuery = () =>
  queryOptions({
    queryKey: keys.me,
    queryFn: () => api.me().catch((e) => (e instanceof ApiError && e.status === 401 ? null : Promise.reject(e))),
    staleTime: 60_000,
  });

export const filesQuery = () => queryOptions({ queryKey: keys.files, queryFn: api.listFiles });
export const usersQuery = () => queryOptions({ queryKey: keys.users, queryFn: api.listUsers });

export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadFile(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.files }),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteFile(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.files }),
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeInput) => api.updateMe(input),
    onSuccess: (user) => {
      queryClient.setQueryData(keys.me, user);
      queryClient.invalidateQueries({ queryKey: keys.users });
    },
  });
}

export function useDeleteMe() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: api.deleteMe, onSuccess: () => queryClient.clear() });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: api.logout, onSuccess: () => queryClient.clear() });
}
