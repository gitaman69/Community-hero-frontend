import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  apiLogin,
  apiRegister,
  apiGoogle,
  setToken,
  clearToken,
  getToken,
} from './api.js';

const USER_KEY = 'ch_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Keep stored user in sync; if token vanished, drop the user.
  useEffect(() => {
    if (!getToken()) {
      setUser(null);
    }
  }, []);

  const persist = useCallback((token, nextUser) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { token, user: nextUser } = await apiLogin(credentials);
      persist(token, nextUser);
      return nextUser;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const { token, user: nextUser } = await apiRegister(payload);
      persist(token, nextUser);
      return nextUser;
    },
    [persist]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      const { token, user: nextUser } = await apiGoogle(credential);
      persist(token, nextUser);
      return nextUser;
    },
    [persist]
  );

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }),
    [user, login, register, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
