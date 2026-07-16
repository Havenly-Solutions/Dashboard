"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApprovalRequest, Role, TeamMember } from "@/types";

export const teamKeys = {
  members: ["team", "members"] as const,
  approvals: ["team", "approvals"] as const,
};

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members,
    queryFn: () => api.get("/admin/team"),
  });
}

export function useApprovalRequests() {
  return useQuery({
    queryKey: teamKeys.approvals,
    queryFn: () => api.get("/admin/approvals"),
    refetchInterval: 60_000,
  });
}

/** Founder/Admin approves \u2192 backend generates an invite link and emails it. No PIN, no SMS/WhatsApp. */
export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.post(`/admin/approvals/${id}/approve`, { role }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: teamKeys.approvals });
      qc.invalidateQueries({ queryKey: teamKeys.members });
    },
  });
}

export function useDenyRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/admin/approvals/${id}/deny`),
    onSettled: () => qc.invalidateQueries({ queryKey: teamKeys.approvals }),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; role: Role }) =>
      api.post<TeamMember>("/admin/team/invite", payload),
    onSettled: () => qc.invalidateQueries({ queryKey: teamKeys.members }),
  });
}

export function useSuspendMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/admin/team/${id}/suspend`),
    onSettled: () => qc.invalidateQueries({ queryKey: teamKeys.members }),
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => api.post(`/admin/team/${id}/resend-invite`),
  });
}
