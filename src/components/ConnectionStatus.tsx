
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { fetchDiamonds } from "@/lib/diamond-api";

export function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus("checking");
    try {
      const response = await fetchDiamonds();
      if (response.data && response.data.length >= 0) {
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      setStatus("disconnected");
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
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
    </div>
  );
}
