
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
}

const FASTAPI_BASE_URL = "https://api.mazalbot.com/api/v1";
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
        this.tokens = JSON.parse(stored);
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

  async authenticate(): Promise<AuthTokens> {
    console.log("Starting authentication process...");
    
    // If we have valid tokens, return them
    if (this.tokens?.access_token) {
      console.log("Using existing tokens for user:", this.tokens.user_id);
      return this.tokens;
    }

    // Check if running in Telegram
    if (this.isRunningInTelegram()) {
      console.log("Running in Telegram, attempting initData authentication");
      const initData = this.getTelegramInitData();
      
      if (initData) {
        try {
          const response = await fetch(`${FASTAPI_BASE_URL}/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ initData }),
          });

          if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
          }

          const tokens: AuthTokens = await response.json();
          this.storeTokens(tokens);
          console.log("Successfully authenticated with Telegram initData for user:", tokens.user_id);
          return tokens;
        } catch (error) {
          console.error("Telegram authentication failed:", error);
          throw error;
        }
      } else {
        throw new Error("No Telegram initData available");
      }
    } else {
      // Fallback for development/testing outside Telegram
      console.log("Not running in Telegram, using fallback authentication");
      
      // Try to get user ID from Telegram data if available, otherwise use development user
      const telegramUserId = this.getTelegramUserId();
      const userId = telegramUserId || "development_user";
      
      console.log("Using fallback authentication for user ID:", userId);
      
      const fallbackTokens: AuthTokens = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo",
        user_id: userId
      };
      this.storeTokens(fallbackTokens);
      return fallbackTokens;
    }
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    const tokens = await this.authenticate();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokens.access_token}`,
    };
  }

  getCurrentTokens(): AuthTokens | null {
    return this.tokens;
  }

  logout(): void {
    console.log("Logging out user");
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!(this.tokens?.access_token);
  }
}

export const authService = AuthService.getInstance();
