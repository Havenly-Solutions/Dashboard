"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { BillingStatus, InvoiceRecord, OrgSubscription, PaymentMethod, SubscriptionTier } from "@/types";

export function useOrgSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions", "orgs"],
    queryFn: () => api.get("/billing/subscriptions"),
  });
}

export function useUpdateSubscriptionTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: SubscriptionTier }) =>
      api.patch<OrgSubscription>(`/billing/subscriptions/${id}`, { tier }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["subscriptions", "orgs"] }),
  });
}

export function useOverrideBillingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BillingStatus }) =>
      api.patch<OrgSubscription>(`/billing/subscriptions/${id}/status`, { status }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["subscriptions", "orgs"] }),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["billing", "payment-methods"],
    queryFn: () => api.get("/billing/payment-methods"),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => api.get("/billing/invoices"),
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
      api.post<PaymentMethod>("/billing/payment-methods", payload),
    onSettled: () => qc.invalidateQueries({ queryKey: ["billing", "payment-methods"] }),
  });
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/billing/payment-methods/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: ["billing", "payment-methods"] }),
  });
}
