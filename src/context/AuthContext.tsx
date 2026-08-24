'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSummary } from '@/types';
import { clientStore } from '@/lib/clientStore';

interface AuthContextType {
  user: UserSummary | null;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; email: string; password: string; color?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserColor: (color: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        const clientUser = clientStore.getCurrentUser();
        setUser(clientUser);
      }
    } catch {
      const clientUser = clientStore.getCurrentUser();
      setUser(clientUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        clientStore.setCurrentUser(data.user);
        return { success: true };
      }
    } catch {
      // Static client fallback
    }
    const localUser = await clientStore.login(credentials.identifier);
    setUser(localUser);
    return { success: true };
  };

  const register = async (data: { username: string; email: string; password: string; color?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        clientStore.setCurrentUser(resData.user);
        return { success: true };
      }
    } catch {
      // Static client fallback
    }
    const localUser = await clientStore.register(data);
    setUser(localUser);
    return { success: true };
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      //
    } finally {
      clientStore.setCurrentUser(null);
      setUser(null);
      window.location.href = './login';
    }
  };

  const updateUserColor = async (color: string) => {
    if (!user) return false;
    const updated = { ...user, color };
    setUser(updated);
    clientStore.setCurrentUser(updated);
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      });
    } catch {
      //
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUserColor,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
