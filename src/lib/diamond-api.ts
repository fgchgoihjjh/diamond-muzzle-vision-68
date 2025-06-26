
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
    const currentUser = authService.getCurrentUser();
    
    console.log("Fetching diamonds from:", `${FASTAPI_BASE_URL}/get_all_stones`);
    console.log("Request headers:", headers);
    console.log("Current authenticated user:", currentUser);
    
    const response = await fetch(`${FASTAPI_BASE_URL}/get_all_stones`, {
      method: "GET",
      headers,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HTTP error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);
    console.log(`Expected user-filtered data for ${currentUser?.first_name || 'unknown'} (ID: ${currentUser?.id || 'unknown'})`);
    
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

    console.log(`Transformed ${diamonds.length} diamonds for user ${currentUser?.first_name || 'unknown'}`);
    return { data: diamonds };
  } catch (error) {
    console.error("Error fetching diamonds:", error);
    
    // Enhanced error handling with more specific messages
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
    console.log("Updating diamond:", id, diamondData);

    // Convert our diamond data to backend format
    const backendData = {
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
    console.log("Deleting diamond with ID:", id);

    // First, let's check if the diamond exists by fetching all diamonds
    const allDiamonds = await fetchDiamonds();
    const diamond = allDiamonds.data?.find(d => d.id.toString() === id.toString());
    
    if (!diamond) {
      console.error("Diamond not found in current inventory");
      return { error: "Diamond not found in current inventory" };
    }

    console.log("Found diamond to delete:", diamond);

    // Try different endpoints and ID formats
    let response: Response;
    
    // Try with the original ID first
    response = await fetch(`${FASTAPI_BASE_URL}/delete_stone/${id}`, {
      method: "DELETE",
      headers,
    });

    console.log("Delete response status:", response.status);

    // If that fails, try with stock number
    if (!response.ok && diamond.stock_number) {
      console.log("Retrying with stock number:", diamond.stock_number);
      response = await fetch(`${FASTAPI_BASE_URL}/delete_stone/${diamond.stock_number}`, {
        method: "DELETE",
        headers,
      });
      console.log("Delete with stock number response status:", response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete error response:", errorText);
      
      // Provide more helpful error message
      if (response.status === 404) {
        return { 
          error: `Diamond not found on server. It may have already been deleted or the ID format is incorrect. Diamond ID: ${id}, Stock: ${diamond.stock_number}` 
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
    console.log("Marking diamond as sold:", id);

    const response = await fetch(`${FASTAPI_BASE_URL}/sold`, {
      method: "POST",
      headers,
      body: JSON.stringify({ stone_id: id }),
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
    delete headers["Content-Type"]; // Let browser set content type for FormData
    
    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading CSV to:", `${FASTAPI_BASE_URL}/upload_inventory`);
    console.log("Upload headers:", headers);

    const response = await fetch(`${FASTAPI_BASE_URL}/upload_inventory`, {
      method: "POST",
      headers,
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
