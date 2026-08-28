'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { apiUrl } from '@/lib/api';

export function FriendRequests() {
  const queryClient = useQueryClient();

  const { data, status } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/follow/pending'));
      return res.json();
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(apiUrl(`/api/follow/${id}/accept`), { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    }
  });

  if (status === 'pending') return null;
  if (!data?.data?.length) return <div className="text-sm text-gray-500 p-4">No pending requests</div>;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 w-80">
      <h3 className="font-semibold mb-4">Friend Requests</h3>
      <div className="space-y-4">
        {data.data.map((req: any) => (
          <div key={req.followerId} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={req.follower.avatarUrl} />
                <AvatarFallback>{req.follower.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{req.follower.username}</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => acceptMutation.mutate(req.followerId)}>Accept</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
