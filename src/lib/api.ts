
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = "https://mazalbot.app/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Create headers with authentication if token exists
const createHeaders = (customHeaders: HeadersInit = {}): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };
  
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const headers = createHeaders(options.headers);
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      // Redirect to login page if we implement it
      // window.location.href = '/login';
      throw new Error("Authentication failed. Please log in again.");
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.detail || data.message || "An error occurred";
      throw new Error(errorMessage);
    }

    return { data: data as T };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    toast({
      title: "API Error",
      description: errorMessage,
      variant: "destructive",
    });
    return { error: errorMessage };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: Record<string, any>) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: "DELETE" }),
    
  upload: async <T>(endpoint: string, file: File): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return fetchApi<T>(endpoint, {
      method: "POST",
      body: formData,
      headers, // Let the browser set the content type with boundary
    });
  },
  
  // Helper to handle login and store token
  login: async (email: string, password: string) => {
    const response = await fetchApi<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      return true;
    }
    
    return false;
  },
  
  // Helper to logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};
