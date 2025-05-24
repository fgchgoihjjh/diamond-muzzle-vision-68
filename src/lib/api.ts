import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ensureStorageBucketExists } from "./create-storage";

const API_BASE_URL = "https://mazalbot.app/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Initialize storage bucket when the app starts
ensureStorageBucketExists().catch(console.error);

async function getAuthHeaders(): Promise<HeadersInit> {
  // Get session from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add authorization header if session exists
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Get auth headers
    const headers = await getAuthHeaders();
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000); // 30s timeout
    });
    
    // Create fetch promise
    const fetchPromise = fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
    // Handle network errors
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        // If parsing fails, use status text
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }
    
    // Parse successful response
    const data = await response.json();
    return { data: data as T };
    
  } catch (error) {
    // Handle different types of errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      // Network error - server unreachable
      const errorMessage = "Network error: Unable to connect to the server. Please check your internet connection and try again.";
      console.error(errorMessage, error);
      return { error: errorMessage };
    } else {
      // Other errors
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("API Error:", errorMessage, error);
      return { error: errorMessage };
    }
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
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const headers = await getAuthHeaders();
      // Remove Content-Type so browser can set it with the correct boundary
      delete headers["Content-Type"]; 
      
      return fetchApi<T>(endpoint, {
        method: "POST",
        body: formData,
        headers,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      console.error("Upload Error:", error);
      return { error: errorMessage };
    }
  },
};
