"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiRequestWithFallback } from "@/lib/api-client";
import { mockEnquiries, mockEnquiryReplies } from "@/lib/mock-data";
import type { EnquiryReply, EnquiryStatus, SupportEnquiry } from "@/types";

export const supportKeys = {
  enquiries: ["support", "enquiries"] as const,
  replies: (id: string) => ["support", "replies", id] as const,
};

export function useEnquiries() {
  return useQuery({
    queryKey: supportKeys.enquiries,
    queryFn: () => apiRequestWithFallback("/api/dashboard/support/enquiries", mockEnquiries),
    refetchInterval: 45_000,
  });
}

export function useEnquiryReplies(enquiryId: string | null) {
  return useQuery({
    queryKey: supportKeys.replies(enquiryId ?? ""),
    queryFn: () =>
      apiRequestWithFallback(`/api/dashboard/support/enquiries/${enquiryId}/replies`, () =>
        mockEnquiryReplies(enquiryId ?? "")
      ),
    enabled: !!enquiryId,
  });
}

export function useReplyToEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      api.post<EnquiryReply>(`/api/dashboard/support/enquiries/${id}/replies`, { body }),
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
      api.patch<SupportEnquiry>(`/api/dashboard/support/enquiries/${id}/status`, { status }),
    onSettled: () => qc.invalidateQueries({ queryKey: supportKeys.enquiries }),
  });
}
