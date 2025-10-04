import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type UserType = 'admin' | 'customer' | 'seller';

type ServerToClientEvents = {
  receiveMessage: (payload: { fromUserId: string | number; fromUserType: UserType; message: string; timestamp: string }) => void;
  userMessage: (payload: { message: string; from: string; timestamp: string }) => void;
};

type ClientToServerEvents = {
  sendMessage: (payload: { toUserId: string | number; message: string }) => void;
  sendToType: (payload: { userType: UserType; message: string }) => void;
  joinRoom: (payload: { userId: string; userType: UserType }) => void;
  leaveRoom: (payload: { userId: string; userType: UserType }) => void;
};

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketContextValue = {
  socket: SocketType | null;
  isConnected: boolean;
  connect: (options: { token: string; url?: string }) => void;
  disconnect: () => void;
  joinRoom: () => void;
  leaveRoom: () => void;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children, url }: { children: React.ReactNode; url?: string }) {
  const socketRef = useRef<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get user data from localStorage
  const getUserData = useCallback((): { userId: string; userType: UserType } | null => {
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') as UserType;
    
    if (!userId || !userType) {
      console.warn('Missing userId or userType in localStorage');
      return null;
    }
    
    return { userId, userType };
  }, []);

  const connect = useCallback(({ token, url: customUrl }: { token: string; url?: string }) => {
    const endpoint = customUrl || url || (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    const s = io(endpoint, {
      transports: ['websocket'],
      withCredentials: false,
      autoConnect: false,
      auth: { token },
    }) as SocketType;
    
    s.on('connect', () => {
      setIsConnected(true);
      // Auto-join room when connected
      const userData = getUserData();
      if (userData) {
        s.emit('joinRoom', {
          userId: userData.userId,
          userType: userData.userType
        });
      }
    });
    
    s.on('disconnect', () => setIsConnected(false));
    s.connect();
    socketRef.current = s;
  }, [url, getUserData]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const joinRoom = useCallback(() => {
    if (!socketRef.current) return;
    
    const userData = getUserData();
    if (!userData) return;
    
    socketRef.current.emit('joinRoom', {
      userId: userData.userId,
      userType: userData.userType
    });
  }, [getUserData]);

  const leaveRoom = useCallback(() => {
    if (!socketRef.current) return;
    
    const userData = getUserData();
    if (!userData) return;
    
    socketRef.current.emit('leaveRoom', {
      userId: userData.userId,
      userType: userData.userType
    });
  }, [getUserData]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const value = useMemo<SocketContextValue>(() => ({
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
  }), [isConnected, connect, disconnect, joinRoom, leaveRoom]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}


