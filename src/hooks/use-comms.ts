"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { CommsMessage } from "@/types";

export const commsKeys = { messages: ["comms", "messages"] as const };

export function useCommsMessages() {
  return useQuery({
    queryKey: commsKeys.messages,
    queryFn: () => api.get("/comms/messages"),
    refetchInterval: 20_000,
  });
}

/** Email or in-app only \u2014 WhatsApp/SMS channels have been removed. */
export function useSendCommsMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { channel: "EMAIL" | "IN_APP"; toEmail: string; subject?: string; body: string }) =>
      api.post<CommsMessage>("/comms/messages", payload),
    onSettled: () => qc.invalidateQueries({ queryKey: commsKeys.messages }),
  });
}
