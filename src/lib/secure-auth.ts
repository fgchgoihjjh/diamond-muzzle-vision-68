
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SecureAuthTokens {
  access_token: string;
  user_id: string;
  session_id: string;
}

const AUTH_STORAGE_KEY = "mazalbot_secure_session";

export class SecureAuthService {
  private static instance: SecureAuthService;
  private tokens: SecureAuthTokens | null = null;

  private constructor() {
    this.loadStoredSession();
  }

  static getInstance(): SecureAuthService {
    if (!SecureAuthService.instance) {
      SecureAuthService.instance = new SecureAuthService();
    }
    return SecureAuthService.instance;
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

  private storeSession(tokens: SecureAuthTokens): void {
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

  async signInWithTelegram(): Promise<SecureAuthTokens> {
    try {
      // In a real implementation, this would use Telegram WebApp authentication
      // For now, we'll use Supabase's anonymous auth as a placeholder
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      if (data.user) {
        const tokens: SecureAuthTokens = {
          access_token: data.session?.access_token || '',
          user_id: data.user.id,
          session_id: data.session?.refresh_token || '',
        };
        
        this.storeSession(tokens);
        return tokens;
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async refreshSession(): Promise<SecureAuthTokens | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session?.user) {
        const tokens: SecureAuthTokens = {
          access_token: data.session.access_token,
          user_id: data.session.user.id,
          session_id: data.session.refresh_token || '',
        };
        
        this.storeSession(tokens);
        return tokens;
      }
      
      return null;
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.clearSession();
      return null;
    }
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.tokens) {
      await this.signInWithTelegram();
    }
    
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.tokens?.access_token}`,
    };
  }

  getCurrentTokens(): SecureAuthTokens | null {
    return this.tokens;
  }

  getCurrentUserId(): string | null {
    return this.tokens?.user_id || null;
  }

  logout(): void {
    this.clearSession();
    supabase.auth.signOut();
  }

  isAuthenticated(): boolean {
    return !!(this.tokens?.access_token);
  }
}

export const secureAuthService = SecureAuthService.getInstance();
