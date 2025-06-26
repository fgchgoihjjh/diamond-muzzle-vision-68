
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthTokens } from '@/lib/auth';

interface AuthContextType {
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting authentication process...');
      
      const newTokens = await authService.verifyTelegramAuth();
      setTokens(newTokens);
      console.log('Authentication successful for user:', newTokens.user_id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication failed:', errorMessage);
      throw err; // Re-throw so caller can handle
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setTokens(null);
    setError(null);
  };

  // Auto-refresh tokens when they're about to expire
  useEffect(() => {
    if (tokens && authService.needsTokenRefresh()) {
      console.log('Token needs refresh, re-authenticating...');
      login().catch(console.error);
    }
  }, [tokens]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get existing valid tokens first
        const existingTokens = authService.getCurrentTokens();
        if (existingTokens) {
          console.log('Using existing valid tokens');
          setTokens(existingTokens);
          return;
        }

        // No valid tokens, attempt authentication
        console.log('No valid tokens found, attempting authentication...');
        const newTokens = await authService.verifyTelegramAuth();
        setTokens(newTokens);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Initial authentication failed';
        console.error('Initial authentication failed:', errorMessage);
        setError(errorMessage);
        // Don't throw here - let user manually retry
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
