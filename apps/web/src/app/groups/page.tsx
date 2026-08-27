'use client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function GroupsDirectory() {
  const { data, status } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5001/api/groups');
      return res.json();
    }
  });

  const handleJoin = async (id: string) => {
    await fetch(`http://localhost:5001/api/groups/${id}/join`, { method: 'POST' });
  };

  if (status === 'pending') return <div className="p-8">Loading groups...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Discover Groups</h1>
        <Button>Create Group</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((group: any) => (
          <div key={group.id} className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            <div className="h-32 bg-gray-200">
              {group.coverPhotoUrl && <img src={group.coverPhotoUrl} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{group.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-400">{group._count?.members || 0} members</span>
                {group.isMember ? (
                  <Button variant="secondary" size="sm">Joined</Button>
                ) : (
                  <Button size="sm" onClick={() => handleJoin(group.id)}>Join</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
