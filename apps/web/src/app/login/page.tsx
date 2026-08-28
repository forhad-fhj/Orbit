'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.isPending) {
          router.push('/onboarding');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred during authentication');
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Sign in to SocialPlatform</h2>
            <p className="mt-2 text-sm text-gray-600">Join our exclusive community</p>
          </div>
          
          <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google Login Failed')}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
