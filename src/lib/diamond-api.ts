
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/types/diamond";
import { authService } from "./auth";

const FASTAPI_BASE_URL = "https://api.mazalbot.com/api/v1";

interface FastApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchDiamonds(): Promise<FastApiResponse<Diamond[]>> {
  try {
    const headers = await authService.getAuthHeaders();
    const userId = authService.getCurrentUserId();
    
    console.log("Fetching diamonds from:", `${FASTAPI_BASE_URL}/get_all_stones`);
    console.log("Request headers:", headers);
    console.log("User ID:", userId);
    
    const response = await fetch(`${FASTAPI_BASE_URL}/get_all_stones`, {
      method: "GET",
      headers,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HTTP error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Transform FastAPI response to match our Diamond interface
    const diamonds: Diamond[] = data.map((stone: any, index: number) => ({
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
  } catch (error) {
    console.error("Error fetching diamonds:", error);
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return { 
        error: "Unable to connect to backend server. Please ensure your FastAPI backend is running and CORS is configured properly." 
      };
    }
    
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch diamonds from backend" 
    };
  }
}

export async function updateDiamond(id: string, diamondData: Partial<Diamond>): Promise<FastApiResponse<Diamond>> {
  try {
    const headers = await authService.getAuthHeaders();
    const userId = authService.getCurrentUserId();
    
    console.log("Updating diamond:", id, diamondData);

    // Convert our diamond data to backend format and include user ID
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

    console.log("Update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update error response:", errorText);
      throw new Error(`Update failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Update response:", data);
    return { data };
  } catch (error) {
    console.error("Error updating diamond:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to update diamond" 
    };
  }
}

export async function deleteDiamond(id: string): Promise<FastApiResponse<void>> {
  try {
    const headers = await authService.getAuthHeaders();
    const userId = authService.getCurrentUserId();
    
    console.log("Deleting diamond with ID:", id, "for user:", userId);

    const response = await fetch(`${FASTAPI_BASE_URL}/delete_stone/${id}`, {
      method: "DELETE",
      headers,
    });

    console.log("Delete response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete error response:", errorText);
      
      if (response.status === 404) {
        return { 
          error: `Diamond not found on server. It may have already been deleted. Diamond ID: ${id}` 
        };
      }
      
      throw new Error(`Delete failed: ${response.status} - ${errorText}`);
    }

    console.log("Diamond deleted successfully");
    return { data: undefined };
  } catch (error) {
    console.error("Error deleting diamond:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to delete diamond" 
    };
  }
}

export async function markDiamondAsSold(id: string): Promise<FastApiResponse<Diamond>> {
  try {
    const headers = await authService.getAuthHeaders();
    const userId = authService.getCurrentUserId();
    
    console.log("Marking diamond as sold:", id, "for user:", userId);

    const response = await fetch(`${FASTAPI_BASE_URL}/sold`, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        stone_id: id,
        user_id: userId 
      }),
    });

    console.log("Mark as sold response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mark as sold error response:", errorText);
      throw new Error(`Mark as sold failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Mark as sold response:", data);
    return { data };
  } catch (error) {
    console.error("Error marking diamond as sold:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to mark diamond as sold" 
    };
  }
}

export async function uploadDiamondCSV(file: File): Promise<FastApiResponse<any>> {
  try {
    const headers = await authService.getAuthHeaders();
    const userId = authService.getCurrentUserId();
    
    // Remove Content-Type to let browser set it for FormData
    const authHeaders = { ...headers };
    delete authHeaders["Content-Type"];
    
    const formData = new FormData();
    formData.append("file", file);
    if (userId) {
      formData.append("user_id", userId);
    }

    console.log("Uploading CSV to:", `${FASTAPI_BASE_URL}/upload_inventory`);
    console.log("Upload headers:", authHeaders);
    console.log("User ID:", userId);

    const response = await fetch(`${FASTAPI_BASE_URL}/upload_inventory`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });

    console.log("Upload response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload error response:", errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Upload response:", data);
    return { data };
  } catch (error) {
    console.error("Error uploading CSV:", error);
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return { 
        error: "Unable to connect to backend server for upload. Please ensure your FastAPI backend is running and CORS is configured properly." 
      };
    }
    
    return { 
      error: error instanceof Error ? error.message : "Failed to upload CSV" 
    };
  }
}

export async function createDiamond(diamondData: Partial<Diamond>): Promise<FastApiResponse<Diamond>> {
  try {
    const headers = await authService.getAuthHeaders();
    const userId = authService.getCurrentUserId();
    
    console.log("Creating diamond:", diamondData, "for user:", userId);

    // Convert our diamond data to backend format and include user ID
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

    console.log("Create response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Create error response:", errorText);
      throw new Error(`Create failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Create response:", data);
    return { data };
  } catch (error) {
    console.error("Error creating diamond:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to create diamond" 
    };
  }
}
