
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

export function StepStatusesNotFound({ circuitId, type, apiError }: {circuitId?: string, type: "notFound" | "error", apiError?: string}) {
  if (type === "notFound") {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive" className="mb-4 border-amber-800 bg-amber-950/50 text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The circuit or step you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link to="/circuits">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Circuits
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="p-4 md:p-6">
      <Alert variant="destructive" className="mb-4 border-red-800 bg-red-950/50 text-red-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {apiError || 'Failed to load step statuses. Please try again later.'}
        </AlertDescription>
      </Alert>
      <Button variant="outline" asChild>
        <Link to={circuitId ? `/circuits/${circuitId}/steps` : "/circuits"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
    </div>
  );
}
