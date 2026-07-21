"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sosKeys } from "@/hooks/use-sos";
import { helpdeskKeys } from "@/hooks/use-helpdesk";
import { commsKeys } from "@/hooks/use-comms";

// Simplified sync for now — in production this would be a WebSocket or SSE listener
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: sosKeys.events() });
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: commsKeys.messages() });
    }, 15000);

    return () => clearInterval(interval);
  }, [queryClient]);
}
