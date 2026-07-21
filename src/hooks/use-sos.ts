"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { SosEvent, SosLogEntry } from "@/types";

export const sosKeys = {
  all: ["sos"] as const,
  events: () => [...sosKeys.all, "events"] as const,
  log: () => [...sosKeys.all, "log"] as const,
};

export function useSosEvents() {
  return useQuery({
    queryKey: sosKeys.events(),
    queryFn: () => apiRequest<SosEvent[]>("/api/v1/dashboard/sos/events"),
    refetchInterval: 5000,
  });
}

export function useSosLog() {
  return useQuery({
    queryKey: sosKeys.log(),
    queryFn: () => apiRequest<SosLogEntry[]>("/api/v1/dashboard/sos/log"),
  });
}

export function useResolveSos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sosEventId, status }: { sosEventId: string; status: string }) =>
      api.patch(`/api/v1/dashboard/sos/events/${sosEventId}/resolve`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sosKeys.all });
    },
  });
}

export const useUpdateSosStatus = useResolveSos;

export function useSosActiveCount() {
    const { data } = useSosEvents();
    return (data ?? []).filter(e => e.status === "ACTIVE" || e.status === "PENDING").length;
}
