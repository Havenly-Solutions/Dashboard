"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiRequestWithFallback } from "@/lib/api-client";
import { mockSosEvents, mockSosLog } from "@/lib/mock-data";
import type { SosEvent, SosLogEntry, SosStatus } from "@/types";

export const sosKeys = {
  events: ["sos", "events"] as const,
  log: ["sos", "log"] as const,
};

export function useSosEvents() {
  return useQuery({
    queryKey: sosKeys.events,
    queryFn: () => apiRequestWithFallback("/api/dashboard/sos/events", mockSosEvents),
    refetchInterval: 30_000,
  });
}

export function useSosLog() {
  return useQuery({
    queryKey: sosKeys.log,
    queryFn: () => apiRequestWithFallback("/api/dashboard/sos/log", mockSosLog),
    refetchInterval: 15_000,
  });
}

/** Count of PENDING + ACTIVE incidents, used for the sidebar/topbar badge. */
export function useSosActiveCount(): number {
  const { data } = useSosEvents();
  if (!data) return 0;
  return data.filter((e) => e.status === "PENDING" || e.status === "ACTIVE").length;
}

export function useUpdateSosStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SosStatus }) =>
      api.patch<SosEvent>(`/api/dashboard/sos/events/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: sosKeys.events });
      const previous = qc.getQueryData<SosEvent[]>(sosKeys.events);
      qc.setQueryData<SosEvent[]>(sosKeys.events, (old) =>
        old?.map((e) => (e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(sosKeys.events, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: sosKeys.events }),
  });
}
