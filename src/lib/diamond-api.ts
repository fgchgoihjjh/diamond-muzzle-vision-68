import { Diamond } from "@/types/diamond";
import { authService } from "./auth";

const FASTAPI_BASE_URL = "https://api.mazalbot.com/api/v1";

interface FastApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function to handle API errors and token refresh
async function handleApiCall<T>(apiCall: () => Promise<Response>): Promise<FastApiResponse<T>> {
  try {
    let response = await apiCall();
    
    // If unauthorized, try to refresh token once
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...');
      await authService.verifyTelegramAuth();
      // Retry the call with new token
      response = await apiCall();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data as T };
    
  } catch (error) {
    console.error("API call failed:", error);
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return { 
        error: "Unable to connect to backend server. Please ensure your FastAPI backend is running and CORS is configured properly." 
      };
    }
    
    return { 
      error: error instanceof Error ? error.message : "API call failed" 
    };
  }
}

export async function fetchDiamonds(): Promise<FastApiResponse<Diamond[]>> {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }

  return handleApiCall<Diamond[]>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Fetching diamonds for user:", userId);
    
    // GET request - user_id as query parameter
    const response = await fetch(`${FASTAPI_BASE_URL}/get_all_stones?user_id=${userId}`, {
      method: "GET",
      headers,
    });
    
    return response;
  }).then(result => {
    if (result.data) {
      // Transform FastAPI response to match our Diamond interface
      const diamonds: Diamond[] = result.data.map((stone: any, index: number) => ({
        id: stone.id || `stone-${index}`,
        stock_number: stone.stock_number || stone.stockNumber || stone.stock || `STOCK-${index}`,
        shape: stone.shape || "Round",
        carat: parseFloat(stone.carat || stone.weight) || 0,
        color: stone.color || "D",
        clarity: stone.clarity || "FL",
        cut: stone.cut || "Excellent",
        price: parseFloat(stone.price || stone.price_per_carat) || 0,
        status: stone.status || "Available",
        created_at: stone.created_at || new Date().toISOString(),
        lab: stone.lab,
        certificate_number: stone.certificate_number,
        measurements: stone.measurements,
        depth: stone.depth ? parseFloat(stone.depth) : undefined,
        table: stone.table ? parseFloat(stone.table) : undefined,
      }));
      
      console.log("Transformed diamonds:", diamonds);
      return { data: diamonds };
    }
    return result;
  });
}

export async function createDiamond(diamondData: Partial<Diamond>): Promise<FastApiResponse<Diamond>> {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }

  return handleApiCall<Diamond>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Creating diamond for user:", userId);

    // POST request - user_id in request body
    const backendData = {
      user_id: userId,
      stock: diamondData.stock_number,
      shape: diamondData.shape,
      weight: diamondData.carat,
      color: diamondData.color,
      clarity: diamondData.clarity,
      cut: diamondData.cut,
      price_per_carat: diamondData.price,
      lab: diamondData.lab,
      certificate_number: diamondData.certificate_number,
    };

    const response = await fetch(`${FASTAPI_BASE_URL}/diamonds`, {
      method: "POST",
      headers,
      body: JSON.stringify(backendData),
    });

    return response;
  });
}

export async function updateDiamond(id: string, diamondData: Partial<Diamond>): Promise<FastApiResponse<Diamond>> {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }

  return handleApiCall<Diamond>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Updating diamond:", id, "for user:", userId);

    // PUT request - user_id in request body
    const backendData = {
      user_id: userId,
      stock: diamondData.stock_number,
      shape: diamondData.shape,
      weight: diamondData.carat,
      color: diamondData.color,
      clarity: diamondData.clarity,
      cut: diamondData.cut,
      price_per_carat: diamondData.price,
      lab: diamondData.lab,
      certificate_number: diamondData.certificate_number,
    };

    const response = await fetch(`${FASTAPI_BASE_URL}/update_stone/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(backendData),
    });

    return response;
  });
}

export async function deleteDiamond(id: string): Promise<FastApiResponse<void>> {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }

  return handleApiCall<void>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Deleting diamond with ID:", id, "for user:", userId);

    // DELETE request - user_id as query parameter
    const response = await fetch(`${FASTAPI_BASE_URL}/delete_stone/${id}?user_id=${userId}`, {
      method: "DELETE",
      headers,
    });

    return response;
  });
}

export async function markDiamondAsSold(id: string): Promise<FastApiResponse<Diamond>> {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }

  return handleApiCall<Diamond>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Marking diamond as sold:", id, "for user:", userId);

    const response = await fetch(`${FASTAPI_BASE_URL}/sold`, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        stone_id: id,
        user_id: userId 
      }),
    });

    return response;
  });
}

export async function uploadDiamondCSV(file: File): Promise<FastApiResponse<any>> {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    return { error: "User not authenticated" };
  }

  return handleApiCall<any>(async () => {
    const headers = await authService.getAuthHeaders();
    // Remove Content-Type to let browser set it for FormData
    const authHeaders = { ...headers };
    delete authHeaders["Content-Type"];
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    console.log("Uploading CSV for user:", userId);

    const response = await fetch(`${FASTAPI_BASE_URL}/upload_inventory`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });

    return response;
  });
}
