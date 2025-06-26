
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
const BACKEND_ACCESS_TOKEN = "your-backend-access-token"; // This should match your FastAPI BACKEND_ACCESS_TOKEN

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
    
    // Extract Telegram user ID
    const telegramUserId = this.getTelegramUserId();
    const userId = telegramUserId || "development_user";
    
    console.log("Using user ID:", userId);
    
    // Create tokens with BACKEND_ACCESS_TOKEN
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
}

export const authService = AuthService.getInstance();
