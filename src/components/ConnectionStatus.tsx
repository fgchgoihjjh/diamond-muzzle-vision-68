
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { fetchDiamonds } from "@/lib/diamond-api";

export function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected" | "cors-error">("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus("checking");
    setErrorDetails(null);
    
    try {
      console.log("Connection status: Starting connection check...");
      const response = await fetchDiamonds();
      
      if (response.data && response.data.length >= 0) {
        console.log("Connection status: Backend connected successfully");
        setStatus("connected");
        setErrorDetails(null);
      } else if (response.error) {
        console.log("Connection status: Backend error -", response.error);
        
        // Detect CORS issues
        if (response.error.includes("CORS") || response.error.includes("connect to backend")) {
          setStatus("cors-error");
          setErrorDetails("CORS configuration needed on backend");
        } else {
          setStatus("disconnected");
          setErrorDetails(response.error);
        }
      } else {
        setStatus("disconnected");
        setErrorDetails("Unknown error occurred");
      }
    } catch (error) {
      console.log("Connection status: Connection failed -", error);
      setStatus("disconnected");
      setErrorDetails(error instanceof Error ? error.message : "Connection failed");
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds for more responsive feedback
    const interval = setInterval(checkConnection, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusContent = () => {
    switch (status) {
      case "checking":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Checking...",
          variant: "secondary" as const,
        };
      case "connected":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Backend Connected",
          variant: "default" as const,
        };
      case "cors-error":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          text: "CORS Issue",
          variant: "destructive" as const,
        };
      case "disconnected":
        return {
          icon: <XCircle className="h-3 w-3" />,
          text: "Backend Offline",
          variant: "destructive" as const,
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusContent.variant} className="flex items-center gap-1">
        {statusContent.icon}
        {statusContent.text}
      </Badge>
      {lastCheck && (
        <span className="text-xs text-muted-foreground">
          Last checked: {lastCheck.toLocaleTimeString()}
        </span>
      )}
      {errorDetails && status !== "connected" && (
        <span className="text-xs text-red-600 max-w-xs truncate" title={errorDetails}>
          {errorDetails}
        </span>
      )}
    </div>
  );
}
