import { telegramAuthService, TelegramAuthService } from './telegram-auth';
import { TelegramAuthResponse, TelegramUser } from '@/types/telegram';

// Keep the existing SecureAuthTokens interface for backward compatibility
export interface SecureAuthTokens {
  access_token: string;
  user_id: string;
  session_id: string;
}

// Extended interface with Telegram data
export interface TelegramSecureTokens extends SecureAuthTokens {
  telegram_user: TelegramUser;
}

export class SecureAuthService {
  private static instance: SecureAuthService;
  private telegramAuth: TelegramAuthService;

  private constructor() {
    this.telegramAuth = telegramAuthService;
  }

  static getInstance(): SecureAuthService {
    if (!SecureAuthService.instance) {
      SecureAuthService.instance = new SecureAuthService();
    }
    return SecureAuthService.instance;
  }

  async signInWithTelegram(): Promise<TelegramSecureTokens> {
    try {
      const telegramTokens = await this.telegramAuth.authenticate();
      
      return {
        access_token: telegramTokens.access_token,
        user_id: telegramTokens.user_id,
        session_id: telegramTokens.session_id,
        telegram_user: telegramTokens.telegram_user
      };
    } catch (error) {
      console.error('Telegram authentication error:', error);
      throw error;
    }
  }

  async refreshSession(): Promise<TelegramSecureTokens | null> {
    try {
      // Try to re-authenticate with existing Telegram data
      const telegramTokens = await this.telegramAuth.authenticate();
      
      return {
        access_token: telegramTokens.access_token,
        user_id: telegramTokens.user_id,
        session_id: telegramTokens.session_id,
        telegram_user: telegramTokens.telegram_user
      };
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.logout();
      return null;
    }
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    return this.telegramAuth.getAuthHeaders();
  }

  getCurrentTokens(): TelegramSecureTokens | null {
    const telegramTokens = this.telegramAuth.getCurrentTokens();
    if (!telegramTokens) return null;

    return {
      access_token: telegramTokens.access_token,
      user_id: telegramTokens.user_id,
      session_id: telegramTokens.session_id,
      telegram_user: telegramTokens.telegram_user
    };
  }

  getCurrentUserId(): string | null {
    return this.telegramAuth.getCurrentUserId();
  }

  getTelegramUser(): TelegramUser | null {
    return this.telegramAuth.getCurrentUser();
  }

  getTelegramUserId(): number | null {
    return this.telegramAuth.getTelegramUserId();
  }

  logout(): void {
    this.telegramAuth.logout();
  }

  isAuthenticated(): boolean {
    return this.telegramAuth.isAuthenticated();
  }

  isTelegramWebApp(): boolean {
    return this.telegramAuth.isTelegramWebApp();
  }
}

export const secureAuthService = SecureAuthService.getInstance();
