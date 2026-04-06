'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@/types';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      if (!res.ok) {
        throw new Error('Not authenticated');
      }

      const data = (await res.json()) as Session;
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!user?.expiresAt) {
      return;
    }

    const expiresAtMs = new Date(user.expiresAt).getTime();
    const timeoutMs = Math.max(expiresAtMs - Date.now(), 0);

    const timeoutId = window.setTimeout(() => {
      refreshSession();
    }, timeoutMs + 250);

    return () => window.clearTimeout(timeoutId);
  }, [refreshSession, user?.expiresAt]);

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      refreshSession();
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [refreshSession]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      setUser(null);
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      router.replace('/login');
      router.refresh();
    }
  };

  return { user, isLoading, logout, refreshSession };
}
