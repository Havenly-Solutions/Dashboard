"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { RoleGrant, UserOverride, AccessChangeLogEntry } from "@/types";

export const accessControlKeys = {
  all: ["access-control"] as const,
  roleGrants: () => [...accessControlKeys.all, "role-grants"] as const,
  userOverrides: () => [...accessControlKeys.all, "user-overrides"] as const,
  changeLog: () => [...accessControlKeys.all, "change-log"] as const,
  effective: (userId: string) => [...accessControlKeys.all, "effective", userId] as const,
};

export function useRoleGrants() {
  return useQuery({
    queryKey: accessControlKeys.roleGrants(),
    queryFn: () => apiRequest<RoleGrant[]>("/api/v1/dashboard/admin/access-control/role-grants"),
  });
}

export function useUserOverrides() {
  return useQuery({
    queryKey: accessControlKeys.userOverrides(),
    queryFn: () => apiRequest<UserOverride[]>("/api/v1/dashboard/admin/access-control/user-overrides"),
  });
}

export function useAccessChangeLog() {
  return useQuery({
    queryKey: accessControlKeys.changeLog(),
    queryFn: () => apiRequest<AccessChangeLogEntry[]>("/api/v1/dashboard/admin/access-control/change-log"),
  });
}

export function useSetRoleGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { role: string; module: string; accessLevel: string }) =>
      api.patch("/api/v1/dashboard/admin/access-control/role-grants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roleGrants() });
    },
  });
}

export function useSetUserOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; module: string; accessLevel: string }) =>
      api.post("/api/v1/dashboard/admin/access-control/user-overrides", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.userOverrides() });
    },
  });
}

export function useRemoveUserOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (overrideId: string) =>
      api.delete(`/api/v1/dashboard/admin/access-control/user-overrides/${overrideId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.userOverrides() });
    },
  });
}

export function useEffectiveModules(userId?: string) {
  return useQuery({
    queryKey: accessControlKeys.effective(userId ?? ""),
    queryFn: () => apiRequest<any[]>(`/api/v1/dashboard/admin/access-control/effective-modules/${userId}`),
    enabled: !!userId,
  });
}

export function useCanAccessModule(moduleKey: string) {
  // Client side check can be implemented here if needed, or fetch from API
  return true;
}
