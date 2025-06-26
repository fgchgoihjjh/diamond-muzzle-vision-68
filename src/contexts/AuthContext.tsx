
import React, { createContext, useContext, useEffect, useState } from 'react';
import { secureAuthService } from '@/lib/secure-auth';
import { TelegramUser } from '@/types/telegram';

interface TelegramSecureTokens {
  access_token: string;
  user_id: string;
  session_id: string;
  telegram_user: TelegramUser;
}

interface AuthContextType {
  tokens: TelegramSecureTokens | null;
  telegramUser: TelegramUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTelegramWebApp: boolean;
  login: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<TelegramSecureTokens | null>(null);
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
    // Initialize Telegram WebApp if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

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
        setError('Authentication required');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    tokens,
    telegramUser: tokens?.telegram_user || null,
    isAuthenticated: !!tokens?.access_token,
    isLoading,
    isTelegramWebApp: secureAuthService.isTelegramWebApp(),
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
