'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Completing sign-in...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      router.push('/login?error=' + encodeURIComponent('Google sign-in was cancelled'));
      return;
    }

    if (!code) {
      router.push('/login?error=' + encodeURIComponent('No auth code received'));
      return;
    }

    apiFetch('/api/auth/google/code', {
      method: 'POST',
      body: JSON.stringify({
        code,
        redirectUri: `${window.location.origin}/auth/callback`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.data.isPending) {
            router.push('/onboarding');
          } else {
            router.push('/');
          }
        } else {
          router.push('/login?error=' + encodeURIComponent(data.error || 'Authentication failed'));
        }
      })
      .catch(() => {
        router.push('/login?error=' + encodeURIComponent('An error occurred during sign-in'));
      });
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
