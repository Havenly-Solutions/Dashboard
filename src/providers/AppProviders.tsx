'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';
import { ReactNode, useState } from 'react';
import { Toaster } from 'sonner';

// ─── Socket initialiser ───────────────────────────────────────────────────────
// Placed inside SessionProvider so useSession() is available.
// This component has no UI — it exists only to call useSocket()
// so the connection is established once for the whole app.

function SocketInit() {
  useSocket();
  return null;
}

// ─── React Query client ───────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered stale after 30s.
        // Socket events will invalidate earlier when relevant changes happen.
        staleTime: 30_000,
        // Retry once on failure, then surface the error
        retry: 1,
        // Don't re-fetch just because the user switched browser tabs
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Keep the client stable across renders (singleton per browser tab)
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client (no sharing between requests)
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

// ─── Provider tree ────────────────────────────────────────────────────────────

interface AppProvidersProps {
  children: ReactNode;
  session?: Parameters<typeof SessionProvider>[0]['session'];
}

export function AppProviders({ children, session }: AppProvidersProps) {
  // useState ensures the client is NOT re-created on every render
  const [queryClient] = useState(() => getQueryClient());

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {/* Establish socket connection once the user is authenticated */}
        <SocketInit />
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </SessionProvider>
  );
}
