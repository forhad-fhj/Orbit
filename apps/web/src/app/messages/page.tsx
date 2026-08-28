'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/components/providers/socket-provider';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Image, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiUrl } from '@/lib/api';

export default function MessengerPage() {
  const { socket, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/chat/conversations'), { credentials: 'include' });
      return res.json();
    }
  });

  const loadMessages = useCallback(async (conversationId: string) => {
    const res = await fetch(apiUrl(`/api/chat/conversations/${conversationId}/messages`), { credentials: 'include' });
    const data = await res.json();
    setMessages(data.data || []);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (payload: any) => {
      if (activeConversation && payload.conversationId === activeConversation.id) {
        setMessages(prev => [...prev, payload.message]);
        socket.emit('chat:read', { conversationId: activeConversation.id });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleTyping = (payload: any) => {
      if (activeConversation && payload.conversationId === activeConversation.id) {
        setTypingUsers(prev => new Set(prev).add(payload.userId));
      }
    };

    const handleStopTyping = (payload: any) => {
      if (activeConversation && payload.conversationId === activeConversation.id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(payload.userId);
          return next;
        });
      }
    };

    socket.on('chat:receive', handleReceive);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop_typing', handleStopTyping);

    return () => {
      socket.off('chat:receive', handleReceive);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop_typing', handleStopTyping);
    };
  }, [socket, activeConversation, queryClient]);

  const handleSend = () => {
    if (!inputText.trim() || !socket || !activeConversation) return;

    const recipientId = activeConversation.participants[0]?.id;
    if (!recipientId) return;

    socket.emit('chat:send', {
      conversationId: activeConversation.id,
      recipientId,
      content: inputText.trim()
    }, (response: any) => {
      if (response.success) {
        setMessages(prev => [...prev, response.data.message]);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    });

    setInputText('');
    socket.emit('chat:stop_typing', { conversationId: activeConversation.id });
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (!socket || !activeConversation) return;

    socket.emit('chat:typing', { conversationId: activeConversation.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:stop_typing', { conversationId: activeConversation.id });
    }, 2000);
  };

  return (
    <div className="flex h-screen max-w-5xl mx-auto border-x bg-white">
      {/* Conversation List */}
      <div className={`w-80 border-r flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b font-semibold text-lg">Messages</div>
        <div className="flex-1 overflow-y-auto">
          {convData?.data?.map((conv: any) => {
            const other = conv.participants[0];
            if (!other) return null;
            const isOnline = onlineUsers.has(other.id);

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition ${activeConversation?.id === conv.id ? 'bg-blue-50' : ''}`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={other.avatarUrl} />
                    <AvatarFallback>{other.username?.[0]}</AvatarFallback>
                  </Avatar>
                  {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{other.username}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage ? conv.lastMessage.content : 'Start a conversation'}
                  </p>
                </div>
                {conv.lastMessage && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Thread */}
      <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center space-x-3 p-4 border-b">
              <button onClick={() => setActiveConversation(null)} className="md:hidden p-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={activeConversation.participants[0]?.avatarUrl} />
                <AvatarFallback>{activeConversation.participants[0]?.username?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{activeConversation.participants[0]?.username}</p>
                <p className="text-xs text-gray-500">
                  {onlineUsers.has(activeConversation.participants[0]?.id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: any) => {
                const isMine = msg.sender?.id === msg.senderId || msg.senderId === undefined;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                      {msg.mediaUrl && <img src={msg.mediaUrl} className="rounded-lg mb-2 max-w-full" alt="" />}
                      {msg.content}
                      {msg.readAt && isMine && <span className="text-[10px] opacity-70 ml-2">✓✓</span>}
                    </div>
                  </div>
                );
              })}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-gray-500 animate-pulse">typing...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Image className="w-5 h-5 text-gray-500" />
              </button>
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Type a message..."
                value={inputText}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
