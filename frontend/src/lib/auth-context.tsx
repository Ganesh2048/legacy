'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from './api-client';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface Family {
  id: string;
  name: string;
  inviteCode: string;
  myRole: string;
  description?: string;
  coverUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  families: Family[];
  currentFamily: Family | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  setCurrentFamily: (family: Family) => void;
  refreshFamilies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamilyState] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('legacy_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfileAndFamilies(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfileAndFamilies = async (authToken: string) => {
    try {
      setIsLoading(true);
      const userData = await fetchApi('/auth/me', { token: authToken });
      setUser(userData);

      const familyList = await fetchApi('/families', { token: authToken });
      setFamilies(familyList);

      if (familyList.length > 0) {
        const savedFamilyId = localStorage.getItem('legacy_active_family_id');
        const active = familyList.find((f: Family) => f.id === savedFamilyId) || familyList[0];
        setCurrentFamilyState(active);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const authToken = res.tokens.accessToken;
    localStorage.setItem('legacy_token', authToken);
    setToken(authToken);
    setUser(res.user);

    await fetchProfileAndFamilies(authToken);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    const authToken = res.tokens.accessToken;
    localStorage.setItem('legacy_token', authToken);
    setToken(authToken);
    setUser(res.user);

    await fetchProfileAndFamilies(authToken);
  };

  const logout = () => {
    localStorage.removeItem('legacy_token');
    localStorage.removeItem('legacy_active_family_id');
    setUser(null);
    setToken(null);
    setFamilies([]);
    setCurrentFamilyState(null);
    setIsLoading(false);
  };

  const setCurrentFamily = (family: Family) => {
    setCurrentFamilyState(family);
    localStorage.setItem('legacy_active_family_id', family.id);
  };

  const refreshFamilies = async () => {
    if (!token) return;
    const familyList = await fetchApi('/families', { token });
    setFamilies(familyList);
    if (familyList.length > 0 && !currentFamily) {
      setCurrentFamilyState(familyList[0]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        families,
        currentFamily,
        isLoading,
        login,
        register,
        logout,
        setCurrentFamily,
        refreshFamilies,
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
