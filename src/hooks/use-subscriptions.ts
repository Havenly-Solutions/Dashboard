"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { OrgSubscription, PaymentMethod, InvoiceRecord } from "@/types";

export function useOrgSubscriptions() {
  return useQuery({
    queryKey: ["org-subscriptions"],
    queryFn: () => apiRequest<OrgSubscription[]>("/api/v1/dashboard/billing/subscriptions"),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => apiRequest<PaymentMethod[]>("/api/v1/dashboard/billing/payment-methods"),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiRequest<InvoiceRecord[]>("/api/v1/dashboard/billing/invoices"),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subId, tier }: { subId: string; tier: string }) =>
      api.patch(`/api/v1/dashboard/billing/subscriptions/${subId}`, { tier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-subscriptions"] });
    },
  });
}

export const useUpdateSubscriptionTier = useUpdateSubscription;

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/api/v1/dashboard/billing/payment-methods", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/dashboard/billing/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useOverrideBillingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subId, status }: { subId: string; status: string }) =>
      api.patch(`/api/v1/dashboard/billing/subscriptions/${subId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-subscriptions"] });
    },
  });
}
