"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { sosKeys } from "@/hooks/use-sos";
import { helpdeskKeys } from "@/hooks/use-helpdesk";
import { commsKeys } from "@/hooks/use-comms";

/**
 * Subscribes once to the Socket.io rooms this dashboard cares about and
 * invalidates the matching query so every open screen re-fetches fresh
 * data instantly. Backend event names to implement (see HANDOFF.md):
 *   dashboard:sos      \u2192 { type: "created" | "updated" }
 *   dashboard:tickets   \u2192 { type: "created" | "updated" }
 *   dashboard:comms     \u2192 { type: "message" }
 */
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket(null);

    const onSos = () => qc.invalidateQueries({ queryKey: sosKeys.events });
    const onTickets = () => qc.invalidateQueries({ queryKey: helpdeskKeys.tickets });
    const onComms = () => qc.invalidateQueries({ queryKey: commsKeys.messages });

    socket.on("dashboard:sos", onSos);
    socket.on("dashboard:tickets", onTickets);
    socket.on("dashboard:comms", onComms);

    return () => {
      socket.off("dashboard:sos", onSos);
      socket.off("dashboard:tickets", onTickets);
      socket.off("dashboard:comms", onComms);
    };
  }, [qc]);
}
