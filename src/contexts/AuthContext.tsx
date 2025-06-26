
import React, { createContext, useContext, useEffect, useState } from 'react';
import { secureAuthService, SecureAuthTokens } from '@/lib/secure-auth';

interface AuthContextType {
  tokens: SecureAuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<SecureAuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newTokens = await secureAuthService.signInWithTelegram();
      setTokens(newTokens);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    secureAuthService.logout();
    setTokens(null);
    setError(null);
  };

  useEffect(() => {
    // Initialize authentication on app start
    const initAuth = async () => {
      try {
        const existingTokens = secureAuthService.getCurrentTokens();
        if (existingTokens) {
          // Try to refresh the session to ensure it's still valid
          const refreshedTokens = await secureAuthService.refreshSession();
          setTokens(refreshedTokens || existingTokens);
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
