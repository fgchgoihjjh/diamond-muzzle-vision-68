
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
const BACKEND_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VySWQiLCJleHAiOjE2ODk2MDAwMDAsImlhdCI6MTY4OTU5NjQwMH0.kWzUkeMTF4LZbU9P5yRmsXrXhWfPlUPukGqI8Nq1rLo";

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

  async authenticate(): Promise<AuthTokens> {
    console.log("Starting authentication process...");
    
    const telegramUserId = this.getTelegramUserId();
    const userId = telegramUserId || "development_user";
    
    console.log("Using user ID:", userId);
    
    const tokens: AuthTokens = {
      access_token: BACKEND_ACCESS_TOKEN,
      user_id: userId
    };
    
    this.storeTokens(tokens);
    console.log("Authentication successful for user:", userId);
    return tokens;
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    const tokens = await this.authenticate();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokens.access_token}`,
    };
  }

  async getFastApiHeaders(): Promise<HeadersInit> {
    const tokens = await this.authenticate();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokens.access_token}`,
    };
  }

  getCurrentTokens(): AuthTokens | null {
    return this.tokens;
  }

  getCurrentUserId(): string | null {
    return this.tokens?.user_id || null;
  }

  logout(): void {
    console.log("Logging out user");
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!(this.tokens?.access_token);
  }

  getFastApiBaseUrl(): string {
    return FASTAPI_BASE_URL;
  }
}

export const authService = AuthService.getInstance();
