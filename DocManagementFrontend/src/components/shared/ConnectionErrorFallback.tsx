import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ServerOff, WifiOff } from "lucide-react";
import { checkApiConnection } from "@/services/api/connectionCheck";

interface ConnectionErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
  errorType?: "network" | "server" | "generic";
}

export function ConnectionErrorFallback({
  message = "Cannot connect to server. Please check your network connection or try again later.",
  onRetry,
  errorType = "network",
}: ConnectionErrorFallbackProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
      return;
    }

    setIsChecking(true);
    const isAvailable = await checkApiConnection();
    setIsChecking(false);

    if (isAvailable) {
      // Force page reload if connection is restored
      window.location.reload();
    }
  };

  const getIcon = () => {
    switch (errorType) {
      case "network":
        return <WifiOff className="h-6 w-6 text-red-500" />;
      case "server":
        return <ServerOff className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center space-y-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
      <Alert
        variant="destructive"
        className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="mt-2">{message}</AlertDescription>
          </div>
        </div>
      </Alert>

      <Button
        variant="outline"
        className="gap-2 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
        onClick={handleRetry}
        disabled={isChecking}
      >
        <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
        {isChecking ? "Checking Connection..." : "Retry Connection"}
      </Button>
    </div>
  );
}

export default ConnectionErrorFallback;
