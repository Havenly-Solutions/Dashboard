"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiRequestWithFallback } from "@/lib/api-client";
import { mockOrgSubscriptions, mockInvoices, mockPaymentMethods } from "@/lib/mock-data";
import type { BillingStatus, InvoiceRecord, OrgSubscription, PaymentMethod, SubscriptionTier } from "@/types";

export function useOrgSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions", "orgs"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/billing/subscriptions", mockOrgSubscriptions),
  });
}

export function useUpdateSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: SubscriptionTier }) =>
      api.patch<OrgSubscription>(`/api/dashboard/billing/subscriptions/${id}`, { tier }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["subscriptions", "orgs"] }),
  });
}

export function useOverrideBillingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BillingStatus }) =>
      api.patch<OrgSubscription>(`/api/dashboard/billing/subscriptions/${id}/status`, { status }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["subscriptions", "orgs"] }),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["billing", "payment-methods"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/billing/payment-methods", mockPaymentMethods),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/billing/invoices", mockInvoices),
  });
}

export function useAddPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    // Real integration: the frontend never sends raw card numbers to
    // havenly-backend. A provider SDK (Stripe Elements / Paystack Inline /
    // Yoco SDK) tokenizes the card client-side and this call only ever
    // sends the resulting token.
    mutationFn: (payload: { paymentMethodToken: string }) =>
      api.post<PaymentMethod>("/api/dashboard/billing/payment-methods", payload),
    onSettled: () => qc.invalidateQueries({ queryKey: ["billing", "payment-methods"] }),
  });
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/dashboard/billing/payment-methods/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: ["billing", "payment-methods"] }),
  });
}
