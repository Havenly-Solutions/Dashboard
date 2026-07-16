"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { EnquiryReply, EnquiryStatus, SupportEnquiry } from "@/types";

export const supportKeys = {
  enquiries: ["support", "enquiries"] as const,
  replies: (id: string) => ["support", "replies", id] as const,
};

export function useEnquiries() {
  return useQuery({
    queryKey: supportKeys.enquiries,
    queryFn: () => api.get("/support/enquiries"),
    refetchInterval: 45_000,
  });
}

export function useEnquiryReplies(enquiryId: string | null) {
  return useQuery({
    queryKey: supportKeys.replies(enquiryId ?? ""),
    queryFn: () => api.get(`/support/enquiries/${enquiryId}/replies`),
    enabled: !!enquiryId,
  });
}

export function useReplyToEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      api.post<EnquiryReply>(`/support/enquiries/${id}/replies`, { body }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: supportKeys.replies(vars.id) });
      qc.invalidateQueries({ queryKey: supportKeys.enquiries });
    },
  });
}

export function useUpdateEnquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) =>
      api.patch<SupportEnquiry>(`/support/enquiries/${id}/status`, { status }),
    onSettled: () => qc.invalidateQueries({ queryKey: supportKeys.enquiries }),
  });
}
