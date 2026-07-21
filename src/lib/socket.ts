"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3005";

let socket: Socket | null = null;

/**
 * Lazily creates a single shared Socket.io connection, authenticated with
 * the current access token. Backend rooms this dashboard listens to:
 *   - "dashboard:sos"    \u2192 SOS event created/updated/resolved
 *   - "dashboard:comms"  \u2192 new comms hub message
 *   - "dashboard:tickets"\u2192 helpdesk ticket created/updated
 */
export function getSocket(token: string | null): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: token ? { token } : undefined,
  });
  return socket;
}

export function connectSocket(token: string | null) {
  const s = getSocket(token);
  if (token) s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
