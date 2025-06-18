import { useEffect, useState } from "react";
import { WifiOff, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import useApiConnection from "@/hooks/useApiConnection";

interface ConnectionStatusIndicatorProps {
  className?: string;
  showTooltip?: boolean;
  showRetryButton?: boolean;
}

export function ConnectionStatusIndicator({
  className,
  showTooltip = true,
  showRetryButton = false,
}: ConnectionStatusIndicatorProps) {
  // Use the hook with reduced checking frequency
  const { isAvailable, isChecking, checkConnection } = useApiConnection({
    checkOnMount: false, // Don't check immediately on mount
    retryInterval: 120000, // 2 minutes between retries
    maxRetries: 1, // Only retry once
  });
  const [visible, setVisible] = useState(false);

  // Only show the indicator when there's an issue
  useEffect(() => {
    // Only show when there's a confirmed issue
    if (isAvailable === false) {
      setVisible(true);
    } else if (isAvailable === true) {
      // Show success briefly, then hide
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000); // Reduced from 5000ms

      return () => clearTimeout(timer);
    }
    // Don't show for null (unknown) state or when checking
  }, [isAvailable]);

  // Don't render anything if we should be hidden
  if (!visible || (isAvailable !== false && !isChecking)) {
    return null;
  }

  const getIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    } else if (isAvailable === true) {
      return <Check className="h-4 w-4" />;
    } else if (isAvailable === false) {
      return <WifiOff className="h-4 w-4" />;
    } else {
      return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (isChecking) {
      return "Checking connection...";
    } else if (isAvailable === true) {
      return "Server connection restored";
    } else if (isAvailable === false) {
      return "Server connection lost";
    } else {
      return "Connection status unknown";
    }
  };

  const getStatusClass = () => {
    if (isChecking) {
      return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    } else if (isAvailable === true) {
      return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    } else if (isAvailable === false) {
      return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    } else {
      return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
    }
  };

  const indicator = (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border",
        getStatusClass(),
        className
      )}
    >
      {getIcon()}
      <span>{getStatusText()}</span>

      {showRetryButton && isAvailable === false && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 ml-1"
          onClick={() => checkConnection()}
          disabled={isChecking}
        >
          Retry
        </Button>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{indicator}</TooltipTrigger>
        <TooltipContent>
          {isAvailable === false
            ? "Server connection lost. Click to retry connection."
            : "Server connection status"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return indicator;
}

export default ConnectionStatusIndicator;
