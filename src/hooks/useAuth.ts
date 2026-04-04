'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch session from API
    fetch('/api/auth/session')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      const { logoutAction } = await import('@/app/actions/auth');
      const result = await logoutAction(undefined as any, new FormData());
      // If we get here (shouldn't due to redirect), clear user
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      setUser(null);
      window.location.href = '/login';
    }
  };

  return { user, isLoading, logout };
}
