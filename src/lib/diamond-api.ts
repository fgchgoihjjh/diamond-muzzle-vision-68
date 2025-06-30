
import { Diamond } from "@/types/diamond";
import { authService } from "./auth";

const FASTAPI_BASE_URL = "https://mazalbot.me/api/v1";

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
      
      // Provide more specific error messages
      let userFriendlyError = `Server error (${response.status})`;
      if (response.status === 403) {
        userFriendlyError = "Access denied. Please check your permissions.";
      } else if (response.status === 404) {
        userFriendlyError = "Resource not found.";
      } else if (response.status === 422) {
        userFriendlyError = "Invalid data provided.";
      } else if (response.status >= 500) {
        userFriendlyError = "Server is temporarily unavailable. Please try again later.";
      }
      
      throw new Error(userFriendlyError);
    }

    const data = await response.json();
    return { data: data as T };
    
  } catch (error) {
    console.error("API call failed:", error);
    
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return { 
        error: "Unable to connect to the server. Please check your internet connection and try again." 
      };
    }
    
    return { 
      error: error instanceof Error ? error.message : "API call failed" 
    };
  }
}

// Add input validation and sanitization
function validateDiamondData(data: Partial<Diamond>): string[] {
  const errors: string[] = [];
  
  if (data.stock_number && !/^[A-Za-z0-9_-]+$/.test(data.stock_number)) {
    errors.push("Stock number contains invalid characters");
  }
  
  if (data.carat && (data.carat <= 0 || data.carat > 100)) {
    errors.push("Carat weight must be between 0 and 100");
  }
  
  if (data.price && (data.price < 0 || data.price > 10000000)) {
    errors.push("Price must be between 0 and 10,000,000");
  }
  
  const validShapes = ["Round", "Princess", "Emerald", "Asscher", "Marquise", "Oval", "Radiant", "Pear", "Heart", "Cushion"];
  if (data.shape && !validShapes.includes(data.shape)) {
    errors.push("Invalid diamond shape");
  }
  
  const validColors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
  if (data.color && !validColors.includes(data.color)) {
    errors.push("Invalid color grade");
  }
  
  const validClarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];
  if (data.clarity && !validClarities.includes(data.clarity)) {
    errors.push("Invalid clarity grade");
  }
  
  return errors;
}

export async function fetchDiamonds(): Promise<FastApiResponse<Diamond[]>> {
  return handleApiCall<Diamond[]>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Fetching all diamonds from backend");
    
    const response = await fetch(`${FASTAPI_BASE_URL}/get_all_stones`, {
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
  // Validate input data
  const validationErrors = validateDiamondData(diamondData);
  if (validationErrors.length > 0) {
    return { error: `Validation failed: ${validationErrors.join(", ")}` };
  }

  return handleApiCall<Diamond>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Creating new diamond via POST /diamonds");

    // Sanitize data before sending
    const backendData = {
      stock: diamondData.stock_number?.trim(),
      shape: diamondData.shape,
      weight: diamondData.carat,
      color: diamondData.color,
      clarity: diamondData.clarity,
      cut: diamondData.cut,
      price_per_carat: diamondData.price,
      lab: diamondData.lab?.trim(),
      certificate_number: diamondData.certificate_number?.trim(),
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
  // Validate input data
  const validationErrors = validateDiamondData(diamondData);
  if (validationErrors.length > 0) {
    return { error: `Validation failed: ${validationErrors.join(", ")}` };
  }

  return handleApiCall<Diamond>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Updating diamond via PUT /diamonds/" + id);

    // Sanitize data before sending
    const backendData = {
      stock: diamondData.stock_number?.trim(),
      shape: diamondData.shape,
      weight: diamondData.carat,
      color: diamondData.color,
      clarity: diamondData.clarity,
      cut: diamondData.cut,
      price_per_carat: diamondData.price,
      lab: diamondData.lab?.trim(),
      certificate_number: diamondData.certificate_number?.trim(),
    };

    const response = await fetch(`${FASTAPI_BASE_URL}/diamonds/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(backendData),
    });

    return response;
  });
}

export async function deleteDiamond(id: string): Promise<FastApiResponse<void>> {
  return handleApiCall<void>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Deleting diamond with ID:", id);

    // Based on OpenAPI spec, the DELETE endpoint uses a query parameter for diamond_id
    const response = await fetch(`${FASTAPI_BASE_URL}/delete_stone/${id}?diamond_id=${id}`, {
      method: "DELETE",
      headers,
    });

    return response;
  });
}

export async function markDiamondAsSold(id: string): Promise<FastApiResponse<Diamond>> {
  return handleApiCall<Diamond>(async () => {
    const headers = await authService.getAuthHeaders();
    console.log("Marking diamond as sold:", id);

    const response = await fetch(`${FASTAPI_BASE_URL}/sold`, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        stone_id: id
      }),
    });

    return response;
  });
}

export async function uploadDiamondCSV(file: File): Promise<FastApiResponse<any>> {
  return handleApiCall<any>(async () => {
    const headers = await authService.getAuthHeaders();
    // Remove Content-Type to let browser set it for FormData
    const authHeaders = { ...headers };
    delete authHeaders["Content-Type"];
    
    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading CSV file");

    const response = await fetch(`${FASTAPI_BASE_URL}/upload_inventory`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });

    return response;
  });
}
