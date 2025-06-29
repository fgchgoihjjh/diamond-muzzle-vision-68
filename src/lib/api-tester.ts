
import { authService } from "./auth";

const FASTAPI_BASE_URL = "https://mazalbot.me/api/v1";

interface ApiTestResult {
  endpoint: string;
  method: string;
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  responseTime?: number;
}

export class ApiTester {
  static async testAllEndpoints(): Promise<ApiTestResult[]> {
    console.log("🧪 Starting comprehensive API testing...");
    const results: ApiTestResult[] = [];

    // Test 1: Alive endpoint (no auth required)
    results.push(await this.testAliveEndpoint());

    // Test 2: Auth headers check
    const authTest = await this.testAuthHeaders();
    results.push(authTest);

    if (authTest.success) {
      // Test 3: Get all stones
      results.push(await this.testGetAllStones());

      // Test 4: Create diamond
      const createResult = await this.testCreateDiamond();
      results.push(createResult);

      if (createResult.success && createResult.data) {
        const diamondId = this.extractDiamondId(createResult.data);
        
        if (diamondId) {
          // Test 5: Update diamond
          results.push(await this.testUpdateDiamond(diamondId));

          // Test 6: Delete diamond
          results.push(await this.testDeleteDiamond(diamondId));
        }
      }

      // Test 7: Create report
      results.push(await this.testCreateReport());
    }

    // Print summary
    this.printTestSummary(results);
    return results;
  }

  private static async testAliveEndpoint(): Promise<ApiTestResult> {
    const startTime = Date.now();
    try {
      console.log("Testing /api/v1/alive...");
      const response = await fetch(`${FASTAPI_BASE_URL}/alive`, {
        method: "GET",
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        endpoint: "/api/v1/alive",
        method: "GET",
        success: response.ok,
        status: response.status,
        data,
        responseTime,
      };
    } catch (error) {
      return {
        endpoint: "/api/v1/alive",
        method: "GET",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private static async testAuthHeaders(): Promise<ApiTestResult> {
    try {
      console.log("Testing authentication headers...");
      const headers = await authService.getAuthHeaders();
      console.log("Auth headers:", headers);

      // Type assertion to access Authorization property safely
      const authHeader = (headers as Record<string, string>).Authorization;

      return {
        endpoint: "Auth Headers",
        method: "CHECK",
        success: !!authHeader,
        data: { hasAuthHeader: !!authHeader },
      };
    } catch (error) {
      return {
        endpoint: "Auth Headers",
        method: "CHECK",
        success: false,
        error: error instanceof Error ? error.message : "Auth failed",
      };
    }
  }

  private static async testGetAllStones(): Promise<ApiTestResult> {
    const startTime = Date.now();
    try {
      console.log("Testing /api/v1/get_all_stones...");
      const headers = await authService.getAuthHeaders();
      
      const response = await fetch(`${FASTAPI_BASE_URL}/get_all_stones`, {
        method: "GET",
        headers,
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log("Get all stones response:", { status: response.status, data });

      return {
        endpoint: "/api/v1/get_all_stones",
        method: "GET",
        success: response.ok,
        status: response.status,
        data,
        responseTime,
      };
    } catch (error) {
      return {
        endpoint: "/api/v1/get_all_stones",
        method: "GET",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private static async testCreateDiamond(): Promise<ApiTestResult> {
    const startTime = Date.now();
    try {
      console.log("Testing POST /api/v1/diamonds...");
      const headers = await authService.getAuthHeaders();
      
      const testDiamond = {
        stock: "TEST001",
        shape: "Round",
        weight: 1.5,
        color: "D",
        clarity: "FL",
        cut: "Excellent",
        price_per_carat: 10000,
        lab: "GIA",
        certificate_number: "TEST123456",
      };

      const response = await fetch(`${FASTAPI_BASE_URL}/diamonds`, {
        method: "POST",
        headers,
        body: JSON.stringify(testDiamond),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log("Create diamond response:", { status: response.status, data });

      return {
        endpoint: "/api/v1/diamonds",
        method: "POST",
        success: response.ok,
        status: response.status,
        data,
        responseTime,
      };
    } catch (error) {
      return {
        endpoint: "/api/v1/diamonds",
        method: "POST",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private static async testUpdateDiamond(diamondId: number): Promise<ApiTestResult> {
    const startTime = Date.now();
    try {
      console.log(`Testing PUT /api/v1/diamonds/${diamondId}...`);
      const headers = await authService.getAuthHeaders();
      
      const updateData = {
        stock: "TEST001_UPDATED",
        shape: "Round",
        weight: 1.6,
        color: "E",
        clarity: "VVS1",
        cut: "Excellent",
        price_per_carat: 11000,
      };

      const response = await fetch(`${FASTAPI_BASE_URL}/diamonds/${diamondId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log("Update diamond response:", { status: response.status, data });

      return {
        endpoint: `/api/v1/diamonds/${diamondId}`,
        method: "PUT",
        success: response.ok,
        status: response.status,
        data,
        responseTime,
      };
    } catch (error) {
      return {
        endpoint: `/api/v1/diamonds/${diamondId}`,
        method: "PUT",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private static async testDeleteDiamond(diamondId: number): Promise<ApiTestResult> {
    const startTime = Date.now();
    try {
      console.log(`Testing DELETE /api/v1/delete_stone/${diamondId}...`);
      const headers = await authService.getAuthHeaders();
      
      const response = await fetch(`${FASTAPI_BASE_URL}/delete_stone/${diamondId}?diamond_id=${diamondId}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log("Delete diamond response:", { status: response.status, data });

      return {
        endpoint: `/api/v1/delete_stone/${diamondId}`,
        method: "DELETE",
        success: response.ok,
        status: response.status,
        data,
        responseTime,
      };
    } catch (error) {
      return {
        endpoint: `/api/v1/delete_stone/${diamondId}`,
        method: "DELETE",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private static async testCreateReport(): Promise<ApiTestResult> {
    const startTime = Date.now();
    try {
      console.log("Testing POST /api/v1/create-report...");
      const headers = await authService.getAuthHeaders();
      
      const reportData = {
        total: 10,
        unique_color: 5,
        total_price: 100000,
        colors: ["D", "E", "F", "G", "H"],
      };

      const response = await fetch(`${FASTAPI_BASE_URL}/create-report`, {
        method: "POST",
        headers,
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log("Create report response:", { status: response.status, data });

      return {
        endpoint: "/api/v1/create-report",
        method: "POST",
        success: response.ok,
        status: response.status,
        data,
        responseTime,
      };
    } catch (error) {
      return {
        endpoint: "/api/v1/create-report",
        method: "POST",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private static extractDiamondId(data: any): number | null {
    if (Array.isArray(data) && data.length > 0 && data[0].id) {
      return parseInt(data[0].id);
    }
    if (data && data.id) {
      return parseInt(data.id);
    }
    return null;
  }

  private static printTestSummary(results: ApiTestResult[]): void {
    console.log("\n🔍 API Test Results Summary:");
    console.log("=".repeat(50));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    results.forEach(result => {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      const time = result.responseTime ? `(${result.responseTime}ms)` : "";
      console.log(`${status} ${result.method} ${result.endpoint} ${time}`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.status) {
        console.log(`   Status: ${result.status}`);
      }
    });
    
    console.log(`\nSummary: ${passed} passed, ${failed} failed`);
    console.log("=".repeat(50));
  }
}
