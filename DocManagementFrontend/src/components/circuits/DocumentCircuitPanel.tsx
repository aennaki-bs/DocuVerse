import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import circuitService from "@/services/circuitService";
import { Document } from "@/models/document";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssignCircuitRequest } from "@/models/documentCircuit";
import ProcessCircuitStepDialog from "./ProcessCircuitStepDialog";

interface DocumentCircuitPanelProps {
  document: Document | null;
  onCircuitAssigned: () => void;
}

const DocumentCircuitPanel = ({
  document,
  onCircuitAssigned,
}: DocumentCircuitPanelProps) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [circuitId, setCircuitId] = useState<number | undefined>(
    document?.circuitId
  );
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch circuits
  const { data: circuits, isLoading: isLoadingCircuits } = useQuery({
    queryKey: ["circuits"],
    queryFn: () => circuitService.getAllCircuits(),
  });

  // Filter circuits by active status, having steps, and document type compatibility
  const circuitsWithSteps = circuits?.filter((circuit) => {
    // Must have steps
    if (!circuit.steps || circuit.steps.length === 0) return false;

    // Must be active (but inactive circuits can be activated)
    // We'll still show inactive circuits but with a label

    // Filter by document type - only show circuits that match the document type
    // If circuit has no documentTypeId, it can be used with any document type (for backward compatibility)
    if (document?.typeId && circuit.documentTypeId) {
      return circuit.documentTypeId === document.typeId;
    }

    // If circuit has no specific document type, allow it for any document type
    return !circuit.documentTypeId;
  });

  const handleAssignCircuit = async () => {
    if (!circuitId) {
      setError("Please select a circuit to assign.");
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      // Check if the circuit is inactive and needs to be activated
      const selectedCircuit = circuits?.find((c) => c.id === circuitId);
      if (selectedCircuit && !selectedCircuit.isActive) {
        // Activate the circuit before assigning
        await circuitService.updateCircuit(circuitId, {
          ...selectedCircuit,
          isActive: true,
        });
        toast.success("Circuit has been activated");
      }

      const request: AssignCircuitRequest = {
        documentId: document!.id,
        circuitId: circuitId,
        comments: comments,
      };
      await circuitService.assignDocumentToCircuit(request);
      toast.success("Circuit assigned to document successfully");
      onCircuitAssigned();
    } catch (error: any) {
      console.error("Error assigning circuit:", error);
      const errorMessage =
        error?.response?.data || "Failed to assign circuit to document";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleProcessSuccess = () => {
    onCircuitAssigned();
  };

  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 h-full flex flex-col">
      <CardHeader className="border-b border-blue-900/30 bg-[#060927]/50 flex-shrink-0">
        <CardTitle className="text-lg">Document Circuit</CardTitle>
        <CardDescription>
          Assign a circuit to this document to start the workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-grow overflow-y-auto">
        {error && (
          <div className="p-3 rounded bg-red-900/20 border border-red-900/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Circuit Filtering Information */}
        {document?.typeId && (
          <div className="p-3 rounded bg-green-900/20 border border-green-800/40 text-green-300 text-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <p>
                  Circuits are filtered to show only those compatible with this
                  document type
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="circuit" className="text-white">
              Select Circuit
            </Label>
            <Select
              onValueChange={(value) => setCircuitId(parseInt(value))}
              defaultValue={document?.circuitId?.toString()}
              disabled={isLoadingCircuits}
            >
              <SelectTrigger className="bg-[#111633] border-blue-900/30 text-white">
                <SelectValue placeholder="Select a circuit" />
              </SelectTrigger>
              <SelectContent className="bg-[#111633] border-blue-900/30 text-white">
                {circuitsWithSteps?.map((circuit) => (
                  <SelectItem key={circuit.id} value={circuit.id.toString()}>
                    {circuit.title} {!circuit.isActive && "(Inactive)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="comments" className="text-white">
              Comments
            </Label>
            <Textarea
              id="comments"
              placeholder="Add comments for assigning this circuit"
              className="bg-[#111633] border-blue-900/30 text-white min-h-[100px]"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 border-t border-blue-900/30 bg-[#060927]/50 flex-shrink-0">
        <Button
          onClick={handleAssignCircuit}
          disabled={isAssigning}
          className="bg-green-600 hover:bg-green-700"
        >
          {isAssigning ? "Assigning..." : "Assign Circuit"}
        </Button>

        {document?.circuitId && (
          <Button
            onClick={() => setIsProcessDialogOpen(true)}
            variant="outline"
          >
            Process Step
          </Button>
        )}
      </CardFooter>

      <ProcessCircuitStepDialog
        documentId={document?.id}
                  documentKey={document?.documentKey}
        currentStep={document?.currentCircuitDetail?.title || ""}
        availableActions={[]}
        open={isProcessDialogOpen}
        onOpenChange={setIsProcessDialogOpen}
        onSuccess={handleProcessSuccess}
      />
    </Card>
  );
};

export default DocumentCircuitPanel;
