'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';


// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api.havenly.solutions';

// ─── Query key registry ───────────────────────────────────────────────────────
// Maps a socket event's entity to the React Query keys that should be
// invalidated so UI refreshes automatically with fresh data.

const ENTITY_QUERY_KEYS: Record<string, string[][]> = {
  team: [['team'], ['team', 'members']],
  intake: [['intakes'], ['analytics', 'summary']],
  alert: [['alerts'], ['analytics', 'summary']],
  dispatch: [['dispatches']],
  sos: [['live-feed'], ['alerts'], ['analytics', 'summary']],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocket() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  // Stable callback that invalidates relevant React Query caches
  const invalidateForEntity = useCallback(
    (entity: string) => {
      const keys = ENTITY_QUERY_KEYS[entity] ?? [[entity]];
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    [queryClient],
  );

  useEffect(() => {
    if (!session?.user) return;

    // Avoid double-connecting
    if (socketRef.current?.connected) return;

    const socket = io(BACKEND_URL, {
      auth: {
        userId: session.user.id,
        role: (session.user as any).role,
        portalId: (session.user as any).portalId,
        // Pass the access token so the backend can optionally verify the socket
        token: (session as any).accessToken,
      },
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2_000,
    });

    socketRef.current = socket;

    // ── Generic data_updated — invalidate matching React Query keys ────────
    socket.on('data_updated', (payload: { entity: string }) => {
      invalidateForEntity(payload.entity);
    });

    // ── Specific events — you can add granular handlers here ──────────────

    socket.on('invite_sent', () => {
      // Invalidate the team list immediately — no polling needed
      queryClient.invalidateQueries({ queryKey: ['team'] });
    });

    socket.on('invite_accepted', () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    });

    socket.on('team_member_removed', () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    });

    socket.on('role_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    });

    socket.on('user_logged_in', () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    });

    socket.on('alert_fired', () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'summary'] });
    });

    socket.on('sos:alert', () => {
      queryClient.invalidateQueries({ queryKey: ['live-feed'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'summary'] });
    });

    socket.on('sos:status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['live-feed'] });
    })
    
    socket.on('sos:battery_critical', () => {
      queryClient.invalidateQueries({ queryKey: ['live-feed'] });
    })

    socket.on('intake_created', () => {
      queryClient.invalidateQueries({ queryKey: ['intakes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'summary'] });
    });

    socket.on('connect', () => {
      console.info('[Socket] Connected to Havenly Solutions backend');
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session, queryClient, invalidateForEntity]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  };
}
