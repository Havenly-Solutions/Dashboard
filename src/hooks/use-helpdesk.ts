"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { HelpdeskAgent, HelpdeskTicket, TicketStatus } from "@/types";

export const helpdeskKeys = {
  tickets: ["helpdesk", "tickets"] as const,
  agents: ["helpdesk", "agents"] as const,
};

export function useHelpdeskTickets() {
  return useQuery({
    queryKey: helpdeskKeys.tickets,
    queryFn: () => api.get("/helpdesk/tickets"),
    refetchInterval: 30_000,
  });
}

export function useHelpdeskAgents() {
  return useQuery({
    queryKey: helpdeskKeys.agents,
    queryFn: () => api.get("/helpdesk/agents"),
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      api.patch<HelpdeskTicket>(`/helpdesk/tickets/${id}/assign`, { agentId }),
    onSettled: () => qc.invalidateQueries({ queryKey: helpdeskKeys.tickets }),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      api.patch<HelpdeskTicket>(`/helpdesk/tickets/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: helpdeskKeys.tickets });
      const previous = qc.getQueryData<HelpdeskTicket[]>(helpdeskKeys.tickets);
      qc.setQueryData<HelpdeskTicket[]>(helpdeskKeys.tickets, (old) =>
        old?.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t))
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(helpdeskKeys.tickets, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: helpdeskKeys.tickets }),
  });
}
