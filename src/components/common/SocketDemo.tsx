import  { useEffect, useMemo, useState } from 'react';
import { useSocket } from '../../context/SocketProvider';

export default function SocketDemo() {
  const { socket, connect, isConnected } = useSocket();
  const [log, setLog] = useState<string[]>([]);
  const [toUserId, setToUserId] = useState('');
  const [message, setMessage] = useState('');

  const token = useMemo(() => {
    // Replace with real JWT retrieval; demo fallback
    return localStorage.getItem('auth_token') || '';
  }, []);

  useEffect(() => {
    if (!isConnected && token) {
      connect({ token });
    }
  }, [isConnected, token, connect]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (payload: any) => {
      setLog((prev) => [JSON.stringify({ event: 'receiveMessage', payload }), ...prev]);
    };
    const handleUserMessage = (payload: any) => {
      setLog((prev) => [JSON.stringify({ event: 'userMessage', payload }), ...prev]);
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('userMessage', handleUserMessage);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('userMessage', handleUserMessage);
    };
  }, [socket]);

  const sendDirect = () => {
    if (!socket) return;
    if (!toUserId || !message) return;
    socket.emit('sendMessage', { toUserId, message });
    setMessage('');
  };

  const sendToSellers = () => {
    if (!socket) return;
    socket.emit('sendToType', { userType: 'seller', message: message || 'Hello sellers!' });
    setMessage('');
  };

  return (
    <div className="rounded-md border border-stroke p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-sm">Socket: {isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="mb-3 flex gap-2">
        <input className="rounded border border-stroke px-2 py-1" placeholder="toUserId" value={toUserId} onChange={(e) => setToUserId(e.target.value)} />
        <input className="flex-1 rounded border border-stroke px-2 py-1" placeholder="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="rounded bg-primary px-3 py-1 text-white" onClick={sendDirect}>Send Direct</button>
        <button className="rounded bg-secondary px-3 py-1 text-white" onClick={sendToSellers}>Broadcast Sellers</button>
      </div>
      <div className="max-h-64 overflow-auto rounded border border-stroke p-2 text-xs">
        {log.map((l, i) => (
          <div key={i} className="mb-1 font-mono">{l}</div>
        ))}
      </div>
    </div>
  );
}


