"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { TeamMember, ApprovalRequest } from "@/types";

export function useTeamMembers() {
  return useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => apiRequest<TeamMember[]>("/api/v1/dashboard/admin/team"),
  });
}

export function useApprovalRequests() {
  return useQuery({
    queryKey: ["admin", "approvals"],
    queryFn: () => apiRequest<ApprovalRequest[]>("/api/v1/dashboard/admin/approvals"),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: string; firstName: string; surname: string; organizationId?: string }) =>
      api.post("/api/v1/dashboard/admin/team/invite", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch(`/api/v1/dashboard/admin/team/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/dashboard/admin/approvals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "approvals"] });
    },
  });
}

export function useDenyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/dashboard/admin/approvals/${id}/deny`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "approvals"] });
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/dashboard/admin/team/${id}/resend-invite`),
  });
}

export function useSuspendMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/dashboard/admin/team/${id}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
  });
}
