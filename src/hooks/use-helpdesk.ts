"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { HelpdeskTicket, HelpdeskAgent } from "@/types";

export const helpdeskKeys = {
  all: ["helpdesk"] as const,
  tickets: () => [...helpdeskKeys.all, "tickets"] as const,
  agents: () => [...helpdeskKeys.all, "agents"] as const,
};

export function useHelpdeskTickets() {
  return useQuery({
    queryKey: helpdeskKeys.tickets(),
    queryFn: () => apiRequest<HelpdeskTicket[]>("/api/v1/dashboard/helpdesk/tickets"),
  });
}

export function useHelpdeskAgents() {
  return useQuery({
    queryKey: helpdeskKeys.agents(),
    queryFn: () => apiRequest<HelpdeskAgent[]>("/api/v1/dashboard/helpdesk/agents"),
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      api.patch(`/api/v1/dashboard/helpdesk/tickets/${ticketId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.tickets() });
    },
  });
}
