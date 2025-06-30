
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
  ready: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface AuthTokens {
  access_token: string;
  user_id: string;
  expires_at: number; // Unix timestamp
}

interface TelegramVerifyResponse {
  access_token: string;
  user_id: string;
  expires_in: number; // seconds from now
}

const FASTAPI_BASE_URL = "https://mazalbot.me/api/v1";
const AUTH_STORAGE_KEY = "mazalbot_auth_tokens";

export class AuthService {
  private static instance: AuthService;
  private tokens: AuthTokens | null = null;

  private constructor() {
    this.loadStoredTokens();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadStoredTokens(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const tokens = JSON.parse(stored) as AuthTokens;
        // Check if token is expired
        if (this.isTokenValid(tokens)) {
          this.tokens = tokens;
        } else {
          this.clearTokens();
        }
      }
    } catch (error) {
      console.error("Failed to load stored tokens:", error);
      this.clearTokens();
    }
  }

  private storeTokens(tokens: AuthTokens): void {
    try {
      this.tokens = tokens;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  }

  private clearTokens(): void {
    this.tokens = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private isTokenValid(tokens: AuthTokens | null): boolean {
    if (!tokens) return false;
    const now = Math.floor(Date.now() / 1000);
    return tokens.expires_at > now + 60; // 60 second buffer
  }

  private getTelegramInitData(): string | null {
    if (window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
    return null;
  }

  private getTelegramUserId(): string | null {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
    return null;
  }

  private isRunningInTelegram(): boolean {
    return !!(window.Telegram?.WebApp);
  }

  async verifyTelegramAuth(): Promise<AuthTokens> {
    console.log("Starting Telegram authentication...");
    
    // Check if running in Telegram environment
    if (!this.isRunningInTelegram()) {
      console.log("Not running in Telegram environment, using development mode");
      // For development/testing outside Telegram
      const fallbackTokens: AuthTokens = {
        access_token: "dev_token_" + Date.now(),
        user_id: "dev_user",
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };
      this.storeTokens(fallbackTokens);
      return fallbackTokens;
    }

    const initData = this.getTelegramInitData();
    if (!initData) {
      throw new Error("No Telegram init data available");
    }

    try {
      // Call the auth endpoint with Telegram init data
      const response = await fetch(`${FASTAPI_BASE_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          init_data: initData
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const authResponse: TelegramVerifyResponse = await response.json();
      
      const tokens: AuthTokens = {
        access_token: authResponse.access_token,
        user_id: authResponse.user_id,
        expires_at: Math.floor(Date.now() / 1000) + authResponse.expires_in
      };

      this.storeTokens(tokens);
      console.log("Authentication successful for user:", tokens.user_id);
      return tokens;

    } catch (error) {
      console.error("Telegram authentication failed:", error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async authenticate(): Promise<AuthTokens> {
    // Check if we have valid tokens
    if (this.tokens && this.isTokenValid(this.tokens)) {
      return this.tokens;
    }

    // Clear invalid tokens and get new ones
    this.clearTokens();
    return await this.verifyTelegramAuth();
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const tokens = await this.authenticate();
      return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokens.access_token}`,
      };
    } catch (error) {
      console.error("Failed to get auth headers:", error);
      // Return headers without auth for graceful degradation
      return {
        "Content-Type": "application/json",
      };
    }
  }

  getCurrentTokens(): AuthTokens | null {
    if (this.tokens && this.isTokenValid(this.tokens)) {
      return this.tokens;
    }
    return null;
  }

  getCurrentUserId(): string | null {
    const tokens = this.getCurrentTokens();
    return tokens?.user_id || null;
  }

  logout(): void {
    console.log("Logging out user");
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!(this.getCurrentTokens()?.access_token);
  }

  // Check if token needs refresh (within 5 minutes of expiry)
  needsTokenRefresh(): boolean {
    if (!this.tokens) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.tokens.expires_at <= now + (5 * 60); // 5 minutes buffer
  }
}

export const authService = AuthService.getInstance();
