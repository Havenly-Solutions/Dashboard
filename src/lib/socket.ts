import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://api.havenly.solutions';

let socket: Socket | null = null;

export const getSocket = (accessToken?: string, portalId?: string, userId?: string, role?: string) => {
  if (!socket && accessToken) {
    socket = io(BACKEND_URL, {
      auth: { 
        token: accessToken,
        portalId,
        userId,
        role
      },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
