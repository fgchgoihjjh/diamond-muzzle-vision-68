
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "@/types/diamond";

const FASTAPI_BASE_URL = "https://api.mazalbot.com/api/v1";

interface FastApiResponse<T> {
  data?: T;
  error?: string;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

export async function fetchDiamonds(): Promise<FastApiResponse<Diamond[]>> {
  try {
    const headers = await getAuthHeaders();
    console.log("Fetching diamonds from:", `${FASTAPI_BASE_URL}/get_all_stones`);
    console.log("Request headers:", headers);
    
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
    
    // Transform FastAPI response to match our Diamond interface
    const diamonds: Diamond[] = data.map((stone: any, index: number) => ({
      id: stone.id || `stone-${index}`,
      stock_number: stone.stock_number || stone.stockNumber || `STOCK-${index}`,
      shape: stone.shape || "Round",
      carat: parseFloat(stone.carat) || 0,
      color: stone.color || "D",
      clarity: stone.clarity || "FL",
      cut: stone.cut || "Excellent",
      price: parseFloat(stone.price) || 0,
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

export async function uploadDiamondCSV(file: File): Promise<FastApiResponse<any>> {
  try {
    const headers = await getAuthHeaders();
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
