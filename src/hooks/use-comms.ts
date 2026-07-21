"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/api-client";
import { CommsMessage } from "@/types";

export const commsKeys = {
  all: ["comms"] as const,
  messages: () => [...commsKeys.all, "messages"] as const,
};

export function useCommsMessages() {
  return useQuery({
    queryKey: commsKeys.messages(),
    queryFn: () => apiRequest<CommsMessage[]>("/api/v1/dashboard/comms/messages"),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { audience: string; channel: string; message: string; title?: string }) =>
      api.post("/api/v1/dashboard/comms/broadcast", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commsKeys.messages() });
    },
  });
}

export const useSendCommsMessage = useSendMessage;
