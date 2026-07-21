"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { SupportEnquiry, EnquiryReply } from "@/types";

export function useEnquiries() {
  return useQuery({
    queryKey: ["support-enquiries"],
    queryFn: () => apiRequest<SupportEnquiry[]>("/api/v1/dashboard/support/enquiries"),
  });
}

export function useEnquiryDetail(enquiryId: string | null) {
  return useQuery({
    queryKey: ["support-enquiry", enquiryId],
    queryFn: () => apiRequest<SupportEnquiry>(`/api/v1/dashboard/support/enquiries/${enquiryId}`),
    enabled: !!enquiryId,
  });
}

export function useEnquiryReplies(enquiryId: string | null) {
  return useQuery({
    queryKey: ["support-enquiry-replies", enquiryId],
    queryFn: () =>
      apiRequest<EnquiryReply[]>(`/api/v1/dashboard/support/enquiries/${enquiryId}/replies`),
    enabled: !!enquiryId,
  });
}

export function useAddEnquiryReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, body }: { enquiryId: string; body: string }) =>
      api.post(`/api/v1/dashboard/support/enquiries/${enquiryId}/replies`, { body }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support-enquiry-replies", variables.enquiryId] });
    },
  });
}

export const useReplyToEnquiry = useAddEnquiryReply;

export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, status }: { enquiryId: string; status: string }) =>
      api.patch(`/api/v1/dashboard/support/enquiries/${enquiryId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-enquiries"] });
    },
  });
}
