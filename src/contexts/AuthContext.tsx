
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthTokens, TelegramUser } from '@/lib/auth';

interface AuthContextType {
  tokens: AuthTokens | null;
  currentUser: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newTokens = await authService.authenticate();
      setTokens(newTokens);
      setCurrentUser(newTokens.telegram_user || null);
      console.log('Authentication successful for user:', newTokens.telegram_user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setTokens(null);
    setCurrentUser(null);
    setError(null);
  };

  useEffect(() => {
    // Initialize authentication on app start
    const initAuth = async () => {
      try {
        // Check if we have stored tokens
        const existingTokens = authService.getCurrentTokens();
        if (existingTokens) {
          setTokens(existingTokens);
          setCurrentUser(existingTokens.telegram_user || null);
          console.log('Restored authentication for user:', existingTokens.telegram_user);
        } else {
          // Attempt to authenticate
          await login();
        }
      } catch (err) {
        console.log('Initial authentication failed, user needs to login');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    tokens,
    currentUser,
    isAuthenticated: !!tokens?.access_token,
    isLoading,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
