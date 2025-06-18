import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import { toast } from "sonner";

interface ResponsibilityCentreSelectProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ResponsibilityCentreSelect = ({
  value,
  onValueChange,
  label = "Responsibility Centre",
  placeholder = "Select a responsibility centre",
  required = false,
  disabled = false,
  className = "",
}: ResponsibilityCentreSelectProps) => {
  const [centres, setCentres] = useState<ResponsibilityCentreSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCentres = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      console.log("Fetching responsibility centres...");
      // Use the getSimple method which has better error handling
      const data = await responsibilityCentreService.getSimple();

      console.log("Fetched centres:", data);

      if (data && data.length > 0) {
        setCentres(data);
      } else {
        console.warn("No responsibility centres returned from API");
        setHasError(true);
      }
    } catch (error) {
      console.error("Failed to fetch responsibility centres:", error);
      setHasError(true);

      // Don't show toast error during registration as it's optional
      if (window.location.pathname !== "/register") {
        toast.error("Failed to load responsibility centres", {
          description:
            "There was a problem connecting to the server. You can try again.",
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, [retryCount]); // Re-run when retry count changes

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "none") {
      onValueChange(undefined);
    } else {
      onValueChange(parseInt(selectedValue));
    }
  };

  if (hasError) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label className="text-sm font-medium">
            <Building2 className="h-4 w-4 inline mr-2" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="flex flex-col space-y-3 p-3 border border-amber-600 bg-amber-900/20 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-300">
              Unable to load responsibility centres. Please try again or contact
              administration.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-amber-900/30 border-amber-700 text-amber-200 hover:bg-amber-800/50"
            onClick={handleRetry}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label
          htmlFor="responsibility-centre-select"
          className="text-sm font-medium"
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value ? value.toString() : undefined}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="responsibility-centre-select" className="w-full">
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading centres...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="none">
              <span className="text-gray-500">No responsibility centre</span>
            </SelectItem>
          )}
          {centres.map((centre) => (
            <SelectItem key={centre.id} value={centre.id.toString()}>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{centre.code}</span>
                <span className="text-gray-500">-</span>
                <span>{centre.descr}</span>
              </div>
            </SelectItem>
          ))}
          {centres.length === 0 && !isLoading && (
            <div className="py-2 px-2 text-center text-sm text-gray-500">
              No centres available
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
