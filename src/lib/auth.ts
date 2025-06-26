
// DEPRECATED: This file is deprecated and will be removed in a future version.
// Please use src/lib/secure-auth.ts for all authentication functionality.

import { secureAuthService, SecureAuthTokens } from './secure-auth';

// Re-export types for backward compatibility
export interface AuthTokens extends SecureAuthTokens {}

// Legacy wrapper class for backward compatibility
export class AuthService {
  private static instance: AuthService;

  private constructor() {
    console.warn('AuthService is deprecated. Please use SecureAuthService from secure-auth.ts');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async authenticate(): Promise<AuthTokens> {
    return secureAuthService.signInWithTelegram();
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    return secureAuthService.getAuthHeaders();
  }

  async getFastApiHeaders(): Promise<HeadersInit> {
    return secureAuthService.getAuthHeaders();
  }

  getCurrentTokens(): AuthTokens | null {
    return secureAuthService.getCurrentTokens();
  }

  getCurrentUserId(): string | null {
    return secureAuthService.getCurrentUserId();
  }

  logout(): void {
    secureAuthService.logout();
  }

  isAuthenticated(): boolean {
    return secureAuthService.isAuthenticated();
  }

  getFastApiBaseUrl(): string {
    // Remove hardcoded URL for security
    return process.env.FASTAPI_BASE_URL || 'https://api.mazalbot.com/api/v1';
  }
}

export const authService = AuthService.getInstance();
