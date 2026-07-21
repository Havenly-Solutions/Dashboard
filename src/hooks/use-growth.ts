"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { PreRegistration, Paginated } from "@/types";

export function usePreRegistrationSummary() {
  return useQuery({
    queryKey: ["growth", "pre-registrations", "summary"],
    queryFn: () => apiRequest("/api/v1/dashboard/growth/pre-registrations/summary"),
    refetchInterval: 30000,
  });
}

export function usePreRegistrationTable(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["growth", "pre-registrations", "table", page, pageSize],
    queryFn: () => apiRequest<Paginated<PreRegistration>>(`/api/v1/dashboard/growth/pre-registrations?page=${page}&pageSize=${pageSize}`),
  });
}

export function usePreRegistrationDetail(id: string | null) {
  return useQuery({
    queryKey: ["growth", "pre-registrations", "detail", id],
    queryFn: () => apiRequest<PreRegistration>(`/api/v1/dashboard/growth/pre-registrations/${id}`),
    enabled: !!id,
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, leadStatus, notes }: { id: string; leadStatus?: string; notes?: string }) =>
      apiRequest(`/api/v1/dashboard/growth/pre-registrations/${id}`, {
        method: "PATCH",
        body: { leadStatus, notes },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth", "pre-registrations"] });
    },
  });
}

export function usePartnersSummary() {
  return useQuery({
    queryKey: ["growth", "partners", "summary"],
    queryFn: () => apiRequest("/api/v1/dashboard/growth/partners/summary"),
    refetchInterval: 30000,
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: "PRE_REGISTRATION" | "PARTNERS"; value: number }) =>
      apiRequest("/api/v1/dashboard/growth/targets", {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth"] });
    },
  });
}

export function useClosePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/v1/dashboard/growth/partners/${id}/close`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth", "partners"] });
    },
  });
}

export function downloadGrowthExport(type: "pre-registrations" | "partners") {
  window.open(`/api/v1/dashboard/growth/export?type=${type}`, "_blank");
}
