"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { SosEvent, SosLogEntry, SosStatus } from "@/types";

export const sosKeys = {
  events: ["sos", "events"] as const,
  log: ["sos", "log"] as const,
};

export function useSosEvents() {
  return useQuery({
    queryKey: sosKeys.events,
    queryFn: () => api.get("/sos/events"),
    refetchInterval: 30_000,
  });
}

export function useSosLog() {
  return useQuery({
    queryKey: sosKeys.log,
    queryFn: () => api.get("/sos/log"),
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
      api.patch<SosEvent>(`/sos/events/${id}/status`, { status }),
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
