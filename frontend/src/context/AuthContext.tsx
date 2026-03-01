import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../api/client';
import type { AuthUser, LoginRequest, RegisterRequest, GuestLoginRequest } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  guestLogin: (data: GuestLoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(!!tokenStorage.get());

  useEffect(() => {
    const storedToken = tokenStorage.get();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    authApi
      .verifyToken()
      .then((res) => {
        setUser(res.user);
        setToken(storedToken);
      })
      .catch(() => {
        tokenStorage.clear();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const guestLogin = useCallback(async (data: GuestLoginRequest) => {
    const res = await authApi.guestLogin(data);
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        guestLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
