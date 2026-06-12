import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user?.token) return;
    const newSocket = io(SOCKET_URL, { auth: { token: user.token }, transports: ['websocket', 'polling'] });
    newSocket.on('connect', () => {
      setConnected(true);
      if (user.organizationId) newSocket.emit('join:org', user.organizationId);
      if (user.id) newSocket.emit('join:user', user.id);
    });
    newSocket.on('disconnect', () => setConnected(false));
    return () => newSocket.disconnect();
  }, [user?.token, user?.organizationId, user?.id]);

  return { socket, connected };
};
export default useSocket;
