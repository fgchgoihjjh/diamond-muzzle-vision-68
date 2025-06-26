
import { TelegramUser, TelegramWebApp, TelegramAuthResponse } from '@/types/telegram';

const FASTAPI_BASE_URL = 'https://api.mazalbot.com/api/v1';
const AUTH_STORAGE_KEY = "mazalbot_telegram_session";

export class TelegramAuthService {
  private static instance: TelegramAuthService;
  private tokens: TelegramAuthResponse | null = null;

  private constructor() {
    this.loadStoredSession();
  }

  static getInstance(): TelegramAuthService {
    if (!TelegramAuthService.instance) {
      TelegramAuthService.instance = new TelegramAuthService();
    }
    return TelegramAuthService.instance;
  }

  private loadStoredSession(): void {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load stored session");
      this.clearSession();
    }
  }

  private storeSession(tokens: TelegramAuthResponse): void {
    try {
      this.tokens = tokens;
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error("Failed to store session");
    }
  }

  private clearSession(): void {
    this.tokens = null;
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  isTelegramWebApp(): boolean {
    return !!(window?.Telegram?.WebApp);
  }

  getTelegramWebApp(): TelegramWebApp | null {
    return window?.Telegram?.WebApp || null;
  }

  getTelegramInitData(): string | null {
    const webApp = this.getTelegramWebApp();
    return webApp?.initData || null;
  }

  getTelegramUser(): TelegramUser | null {
    const webApp = this.getTelegramWebApp();
    return webApp?.initDataUnsafe?.user || null;
  }

  async authenticateWithTelegram(): Promise<TelegramAuthResponse> {
    const initData = this.getTelegramInitData();
    
    if (!initData) {
      throw new Error('No Telegram initData available. Please open this app through Telegram.');
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          init_data: initData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Authentication failed: ${response.status}`);
      }

      const tokens: TelegramAuthResponse = await response.json();
      this.storeSession(tokens);
      return tokens;
    } catch (error) {
      console.error('Telegram authentication failed:', error);
      throw error;
    }
  }

  // Fallback authentication for development/testing outside Telegram
  async authenticateWithFallback(): Promise<TelegramAuthResponse> {
    try {
      const mockUser: TelegramUser = {
        id: 12345,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser'
      };

      // In development, create a mock session
      const mockTokens: TelegramAuthResponse = {
        access_token: 'dev_token_' + Date.now(),
        user_id: 'dev_user_' + mockUser.id,
        telegram_user: mockUser,
        session_id: 'dev_session_' + Date.now()
      };

      this.storeSession(mockTokens);
      return mockTokens;
    } catch (error) {
      console.error('Fallback authentication failed:', error);
      throw error;
    }
  }

  async authenticate(): Promise<TelegramAuthResponse> {
    if (this.isTelegramWebApp()) {
      return this.authenticateWithTelegram();
    } else {
      // For development/testing outside Telegram
      console.warn('Running outside Telegram WebApp, using fallback authentication');
      return this.authenticateWithFallback();
    }
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.tokens) {
      await this.authenticate();
    }
    
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.tokens?.access_token}`,
    };
  }

  getCurrentTokens(): TelegramAuthResponse | null {
    return this.tokens;
  }

  getCurrentUserId(): string | null {
    return this.tokens?.user_id || null;
  }

  getTelegramUserId(): number | null {
    return this.tokens?.telegram_user?.id || null;
  }

  getCurrentUser(): TelegramUser | null {
    return this.tokens?.telegram_user || null;
  }

  logout(): void {
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!(this.tokens?.access_token);
  }
}

export const telegramAuthService = TelegramAuthService.getInstance();
