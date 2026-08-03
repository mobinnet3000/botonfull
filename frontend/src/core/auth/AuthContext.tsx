import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TOKEN_KEY } from '../api/client';
import { authApi } from '../services/auth';
import type { FullUserData, Role, User } from '../types';
import { canAccess, canWrite } from './roles';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  fullData: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | undefined;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  canWrite: (resource: Parameters<typeof canWrite>[1]) => boolean;
  canAccess: (resource: string) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const queryClient = useQueryClient();

  const fullDataQuery = useQuery({
    queryKey: ['full-data'],
    queryFn: () => authApi.fullData(),
    enabled: Boolean(token),
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    setToken(res.token);
    await queryClient.invalidateQueries({ queryKey: ['full-data'] });
  }, [queryClient]);

  const logout = useCallback(() => {
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['full-data'] });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const user = fullDataQuery.data?.user ?? null;
    const role = user?.role;
    return {
      token,
      user,
      fullData: fullDataQuery.data ?? null,
      isAuthenticated: Boolean(token),
      isLoading: Boolean(token) && fullDataQuery.isLoading,
      role,
      login,
      logout,
      canWrite: (resource) => canWrite(role, resource),
      canAccess: (resource) => canAccess(role, resource),
      refresh,
    };
  }, [token, fullDataQuery.data, fullDataQuery.isLoading, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}