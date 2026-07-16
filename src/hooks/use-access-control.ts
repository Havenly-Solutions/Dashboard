"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { effectiveModulesFor, resolveAccessibleModuleKeys } from "@/lib/permissions";
import { useAuth } from "@/lib/auth-context";
import type { AccessChangeLogEntry, Role, RoleGrant, UserOverride } from "@/types";

const keys = {
  roleGrants: ["access-control", "role-grants"] as const,
  userOverrides: ["access-control", "user-overrides"] as const,
  changeLog: ["access-control", "change-log"] as const,
};

export function useRoleGrants() {
  return useQuery({
    queryKey: keys.roleGrants,
    queryFn: () => api.get("/admin/access-control/role-grants"),
  });
}

export function useUserOverrides() {
  return useQuery({
    queryKey: keys.userOverrides,
    queryFn: () => api.get("/admin/access-control/user-overrides"),
  });
}

export function useAccessChangeLog() {
  return useQuery({
    queryKey: keys.changeLog,
    queryFn: () => api.get("/admin/access-control/change-log"),
  });
}

export function useSetRoleGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { role: Role; moduleKey: string; enabled: boolean }) =>
      api.post<RoleGrant>("/admin/access-control/role-grants", payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: keys.roleGrants });
      const previous = qc.getQueryData<RoleGrant[]>(keys.roleGrants) ?? [];
      const next = [...previous.filter((g) => !(g.role === payload.role && g.moduleKey === payload.moduleKey)), payload];
      qc.setQueryData(keys.roleGrants, next);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(keys.roleGrants, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.roleGrants });
      qc.invalidateQueries({ queryKey: keys.changeLog });
    },
  });
}

export function useSetUserOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; userName: string; userRole: Role; moduleKey: string; enabled: boolean; reason?: string }) =>
      api.post<UserOverride>("/admin/access-control/user-overrides", payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.userOverrides });
      qc.invalidateQueries({ queryKey: keys.changeLog });
    },
  });
}

export function useRemoveUserOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/access-control/user-overrides/${id}`),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.userOverrides });
      qc.invalidateQueries({ queryKey: keys.changeLog });
    },
  });
}

/** The real, grant-aware set of modules the current user can see \u2014 use this instead of the static modulesForRole() in any rendered UI. */
export function useEffectiveModules() {
  const { user } = useAuth();
  const { data: roleGrants } = useRoleGrants();
  const { data: userOverrides } = useUserOverrides();
  return useMemo(
    () => effectiveModulesFor(user, roleGrants ?? [], userOverrides ?? []),
    [user, roleGrants, userOverrides]
  );
}

/** Grant-aware access check for a single module key, e.g. inside a route guard. */
export function useCanAccessModule(moduleKey: string | undefined): boolean {
  const { user } = useAuth();
  const { data: roleGrants } = useRoleGrants();
  const { data: userOverrides } = useUserOverrides();
  return useMemo(() => {
    if (!moduleKey) return true;
    return resolveAccessibleModuleKeys(user, roleGrants ?? [], userOverrides ?? []).has(moduleKey);
  }, [user, roleGrants, userOverrides, moduleKey]);
}
