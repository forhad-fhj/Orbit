'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/components/providers/socket-provider';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { apiUrl } from '@/lib/api';

const notifLabel: Record<string, string> = {
  LIKE: 'liked your post',
  COMMENT: 'commented on your post',
  FOLLOW: 'started following you',
  FOLLOW_REQUEST: 'sent you a follow request',
  MESSAGE: 'sent you a message',
  GROUP_INVITE: 'invited you to a group',
};

export function NotificationBell() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const { data: countData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/notifications/unread-count'), { credentials: 'include' });
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/notifications'), { credentials: 'include' });
      return res.json();
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (!socket) return;

    const handler = (notification: any) => {
      queryClient.invalidateQueries({ queryKey: ['notif-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      setToast(notification);
      setTimeout(() => setToast(null), 4000);
    };

    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [socket, queryClient]);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      await fetch(apiUrl('/api/notifications/read'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      queryClient.invalidateQueries({ queryKey: ['notif-count'] });
    }
  };

  const unreadCount = countData?.data?.count || 0;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-white border shadow-lg rounded-lg p-4 flex items-center space-x-3 animate-in slide-in-from-right max-w-sm">
          <Avatar className="w-8 h-8">
            <AvatarImage src={toast.actor?.avatarUrl} />
            <AvatarFallback>{toast.actor?.username?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold text-sm">{toast.actor?.username}</span>{' '}
            <span className="text-sm text-gray-600">{notifLabel[toast.type] || 'interacted with you'}</span>
          </div>
        </div>
      )}

      <div className="relative">
        <button onClick={handleOpen} className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-xl z-50">
            <div className="p-3 border-b font-semibold text-sm">Notifications</div>
            {notifData?.data?.length === 0 && (
              <div className="p-4 text-gray-400 text-sm text-center">No notifications yet</div>
            )}
            {notifData?.data?.map((n: any) => (
              <div key={n.id} className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={n.actor?.avatarUrl} />
                  <AvatarFallback>{n.actor?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{n.actor?.username}</span>{' '}
                    {notifLabel[n.type] || 'interacted with you'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
