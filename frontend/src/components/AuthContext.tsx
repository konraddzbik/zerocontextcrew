import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function login(username: string, password: string): boolean {
    const validUser = import.meta.env.VITE_AUTH_USERNAME || 'storyteller';
    const validPass = import.meta.env.VITE_AUTH_PASSWORD || 'taleworld';

    if (username === validUser && password === validPass) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }

  function logout() {
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
