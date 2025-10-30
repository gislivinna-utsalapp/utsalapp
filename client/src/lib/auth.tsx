import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Store } from '@shared/schema';

interface AuthUser {
  user: User;
  store?: Store;
  token: string;
}

interface AuthContextType {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  logout: () => void;
  isStore: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        setAuthUserState(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const setAuthUser = (user: AuthUser | null) => {
    setAuthUserState(user);
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  };

  const logout = () => {
    setAuthUser(null);
  };

  const isStore = authUser?.user.role === 'store';
  const isAdmin = authUser?.user.role === 'admin';

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, logout, isStore, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
