'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, FileText, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiUrl } from '@/lib/api';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: analytics, status: analyticsStatus } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/analytics'), { credentials: 'include' });
      if (res.status === 403) throw new Error('Forbidden');
      return res.json();
    }
  });

  const { data: reports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/admin/reports'), { credentials: 'include' });
      return res.json();
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(apiUrl(`/api/admin/reports/${id}/resolve`), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId: string) => {
      await fetch(apiUrl(`/api/admin/users/${userId}/suspend`), {
        method: 'POST',
        credentials: 'include'
      });
    }
  });

  if (analyticsStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 mt-2">Admin privileges required to view this page.</p>
        </div>
      </div>
    );
  }

  if (analyticsStatus === 'pending') return <div className="p-8 text-center">Loading dashboard...</div>;

  const stats = analytics?.data;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" /> Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-3xl font-bold">{stats?.totalPosts || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily Active Users</p>
              <p className="text-3xl font-bold">{stats?.dau || 0}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Posts (Last 7 Days)</h3>
          <div className="flex items-end space-x-2 h-32">
            {Object.entries(stats?.postsByDay || {}).slice(-7).map(([day, count]: [string, any]) => {
              const maxCount = Math.max(...Object.values(stats?.postsByDay || {}).map(Number), 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.max(height, 4)}%` }} />
                  <span className="text-[10px] text-gray-400 mt-1">{day.slice(-5)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Signups (Last 30 Days)</h3>
          <div className="flex items-end space-x-1 h-32">
            {Object.entries(stats?.signupsByDay || {}).slice(-30).map(([day, count]: [string, any]) => {
              const maxCount = Math.max(...Object.values(stats?.signupsByDay || {}).map(Number), 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={day} className="flex-1">
                  <div className="w-full bg-green-500 rounded-t" style={{ height: `${Math.max(height, 4)}%` }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-6 border-b flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-lg">Reports Queue</h3>
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium ml-auto">
            {reports?.data?.filter((r: any) => r.status === 'PENDING').length || 0} pending
          </span>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {reports?.data?.length === 0 && (
            <div className="p-6 text-center text-gray-400">No reports to review</div>
          )}
          {reports?.data?.map((report: any) => (
            <div key={report.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {report.status}
                  </span>
                  <span className="text-sm font-medium">{report.targetType}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{report.reason}</p>
                <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                {report.status === 'PENDING' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => resolveMutation.mutate({ id: report.id, status: 'REVIEWED' })}>
                      Review
                    </Button>
                    <Button size="sm" onClick={() => resolveMutation.mutate({ id: report.id, status: 'ACTIONED' })}>
                      Action
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
