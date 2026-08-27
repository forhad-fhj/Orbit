'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io as socketIO, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set()
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = socketIO('http://localhost:5001', {
      withCredentials: true,
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('chat:join_rooms');
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('presence:online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    s.on('presence:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
