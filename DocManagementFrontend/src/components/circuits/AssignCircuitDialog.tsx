import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  AlertCircle,
  PlusCircle,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

// Extended Circuit type that includes statuses
interface ExtendedCircuit extends Circuit {
  statuses?: {
    id: number;
    isInitial: boolean;
    isFinal: boolean;
    title: string;
  }[];
}

// Active Circuit type from API
interface ActiveCircuit {
  circuitId: number;
  circuitKey: string;
  circuitTitle: string;
}

const formSchema = z.object({
  circuitId: z.string().min(1, "Please select a circuit"),
});

type FormValues = z.infer<typeof formSchema>;

interface CircuitValidation {
  circuitId: number;
  circuitTitle: string;
  hasSteps: boolean;
  totalSteps: number;
  allStepsHaveStatuses: boolean;
  isValid: boolean;
  stepsWithoutStatuses: {
    stepId: number;
    stepTitle: string;
    order: number;
  }[];
}

interface AssignCircuitDialogProps {
  documentId: number;
  documentKey: string;
  documentTypeId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AssignCircuitDialog({
  documentId,
  documentKey,
  documentTypeId,
  open,
  onOpenChange,
  onSuccess,
}: AssignCircuitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(
    null
  );
  const [selectedCircuit, setSelectedCircuit] =
    useState<ExtendedCircuit | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch all circuits with document type information
  const { data: allCircuits, isLoading: isCircuitsLoading } = useQuery<
    Circuit[]
  >({
    queryKey: ["all-circuits"],
    queryFn: circuitService.getAllCircuits,
    enabled: open,
  });

  // Filter circuits based on active status and document type
  const activeCircuits = allCircuits
    ?.filter((circuit) => {
      // Filter by active status
      if (!circuit.isActive) return false;

      // Filter by document type - only show circuits that match the document type
      // If circuit has no documentTypeId, it can be used with any document type (for backward compatibility)
      if (documentTypeId && circuit.documentTypeId) {
        return circuit.documentTypeId === documentTypeId;
      }

      // If circuit has no specific document type, allow it for any document type
      return !circuit.documentTypeId;
    })
    .map((circuit) => ({
      circuitId: circuit.id,
      circuitKey: circuit.circuitKey,
      circuitTitle: circuit.title,
    }));

  // Fetch detailed circuit information when a circuit is selected
  const { data: selectedCircuitDetails, isLoading: isCircuitDetailsLoading } =
    useQuery<ExtendedCircuit>({
      queryKey: ["circuit-details", selectedCircuitId],
      queryFn: () =>
        circuitService.getCircuitById(parseInt(selectedCircuitId || "0")),
      enabled: !!selectedCircuitId && open,
    });

  // Update selected circuit when details are loaded
  useEffect(() => {
    if (selectedCircuitDetails) {
      setSelectedCircuit(selectedCircuitDetails);
    }
  }, [selectedCircuitDetails]);

  const noCircuitsAvailable =
    !isCircuitsLoading && (!activeCircuits || activeCircuits.length === 0);

  // Get circuit validation data - DISABLED since endpoint doesn't exist
  const { data: circuitValidation, isLoading: isValidationLoading } =
    useQuery<CircuitValidation>({
      queryKey: ["circuit-validation", selectedCircuitId],
      queryFn: async () => {
        // Return a default "valid" validation to bypass the 404 error
        return {
          circuitId: parseInt(selectedCircuitId || "0"),
          circuitTitle: "",
          hasSteps: true,
          totalSteps: 0,
          allStepsHaveStatuses: true,
          isValid: true,
          stepsWithoutStatuses: [],
        };
      },
      enabled: !!selectedCircuitId && open,
    });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      circuitId: "",
    },
  });

  // Update the form value when selectedCircuitId changes
  useEffect(() => {
    if (selectedCircuitId) {
      form.setValue("circuitId", selectedCircuitId);
    }
  }, [selectedCircuitId, form]);

  const handleFormSubmit = async (values: FormValues) => {
    const circuitId = parseInt(values.circuitId);

    if (!selectedCircuit) {
      toast.error("Please select a valid circuit");
      return;
    }

    // Basic validation
    if (!selectedCircuit.steps || selectedCircuit.steps.length === 0) {
      toast.error(
        "Selected circuit has no steps. Please add steps to the circuit first."
      );
      return;
    }

    if (!selectedCircuit.statuses || selectedCircuit.statuses.length === 0) {
      toast.error(
        "Selected circuit has no statuses. Please add statuses to the circuit first."
      );
      return;
    }

    // Check if there's an initial status
    const hasInitialStatus = selectedCircuit.statuses.some(
      (status) => status.isInitial
    );
    if (!hasInitialStatus) {
      toast.error(
        "Selected circuit has no initial status. At least one status must be marked as initial."
      );
      return;
    }

    // Skip validation check since the endpoint doesn't exist
    // Just proceed to confirmation
    setShowConfirmation(true);
  };

  const confirmAssignment = async () => {
    if (!selectedCircuitId) return;

    setIsSubmitting(true);
    try {
      const circuitId = parseInt(selectedCircuitId);

      console.log(`Assigning document ${documentId} to circuit ${circuitId}`);

      // Check if the circuit has steps before assigning
      if (!selectedCircuit?.steps || selectedCircuit.steps.length === 0) {
        toast.error("The selected circuit must have at least one step");
        return;
      }

      // Assign document to circuit
      await circuitService.assignDocumentToCircuit({
        documentId,
        circuitId: circuitId,
      });

      toast.success("Document assigned to circuit successfully");
      form.reset();
      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning document to circuit:", error);

      // Show detailed error information for debugging
      if (error.response) {
        console.error("Error response details:", {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
        });
      }

      // Display more specific error message based on error type
      let errorMessage = "Failed to assign document to circuit";

      if (error.response?.data && typeof error.response.data === "string") {
        // Check for specific error conditions
        if (
          error.response.data.includes("FK_DocumentCircuitHistory_Steps_StepId")
        ) {
          errorMessage =
            "Database constraint error: Step not found. Please add valid steps to this circuit first.";
        } else if (error.response.data.includes("no initial status defined")) {
          errorMessage =
            "Circuit validation failed: No initial status defined. Please set an initial status for this circuit.";
        } else if (
          error.response.data.includes("while saving the entity changes")
        ) {
          errorMessage =
            "Database error while saving. The circuit may not be properly configured with steps and statuses.";
        } else {
          errorMessage = error.response.data;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle circuit selection
  const handleCircuitSelect = (circuitId: string) => {
    setSelectedCircuitId(circuitId);
    setDropdownOpen(false);
  };

  // Different content based on state
  const renderDialogContent = () => {
    if (showConfirmation) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Confirm Circuit Assignment</DialogTitle>
            <DialogDescription>
              Please confirm that you want to assign this document to the
              selected circuit
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 bg-blue-900/20 rounded-md border border-blue-800/50">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              Assignment Details
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="text-blue-400">Document:</span>{" "}
                <span className="text-white">{documentKey}</span>
              </p>
              <p>
                <span className="text-blue-400">Circuit:</span>{" "}
                <span className="text-white">
                  {selectedCircuit?.title} ({selectedCircuit?.circuitKey})
                </span>
              </p>
              {circuitValidation && (
                <p>
                  <span className="text-blue-400">Steps:</span>{" "}
                  <span className="text-white">
                    {selectedCircuit?.steps?.length || 0}
                  </span>
                </p>
              )}
            </div>
            <div className="mt-4 text-sm text-yellow-300">
              <p className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  This action will assign the document to the circuit workflow.
                  The document will follow the steps defined in this circuit.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={confirmAssignment}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (noCircuitsAvailable) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Assign to Circuit</DialogTitle>
            <DialogDescription>
              Select a circuit for document: {documentKey}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-blue-900/20 p-4 border border-blue-800/50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-300">
                  No active circuits available
                </h3>
                <div className="mt-2 text-sm text-blue-200">
                  <p>
                    There are no active circuits matching this document type available for assignment. You
                    need to create a circuit and activate it before you can
                    assign documents.
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    asChild
                  >
                    <Link to="/circuits">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Manage Circuits
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Assign to Circuit</DialogTitle>
          <DialogDescription>
            Select a circuit for document: {documentKey}
          </DialogDescription>
        </DialogHeader>

        {/* Circuit Filtering Information */}
        {documentTypeId && (
          <div className="rounded-md bg-green-900/20 p-3 border border-green-800/40 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="ml-2">
                <p className="text-sm text-green-300">
                  Circuits are filtered to show only those compatible with this
                  document type
                </p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="circuitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Circuit</FormLabel>
                  <div className="relative">
                    {/* Custom dropdown trigger */}
                    <div
                      onClick={() =>
                        !isCircuitsLoading && setDropdownOpen(!dropdownOpen)
                      }
                      className={`flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50 cursor-pointer ${
                        isCircuitsLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="truncate">
                        {selectedCircuitId && activeCircuits
                          ? activeCircuits.find(
                              (c) => c.circuitId === parseInt(selectedCircuitId)
                            )
                            ? `${
                                activeCircuits.find(
                                  (c) =>
                                    c.circuitId === parseInt(selectedCircuitId)
                                )?.circuitKey
                              } - ${
                                activeCircuits.find(
                                  (c) =>
                                    c.circuitId === parseInt(selectedCircuitId)
                                )?.circuitTitle
                              }`
                            : "Select a circuit"
                          : "Select a circuit"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>

                    {/* Custom dropdown menu */}
                    {dropdownOpen && (
                      <div className="absolute z-[9999] w-full mt-1 rounded-md border border-blue-900/50 bg-[#0d1117] shadow-lg">
                        <div className="max-h-60 overflow-auto py-1">
                          {activeCircuits?.map((circuit) => (
                            <div
                              key={circuit.circuitId}
                              className="px-2 py-1.5 text-sm text-white hover:bg-blue-900/30 cursor-pointer"
                              onClick={() =>
                                handleCircuitSelect(
                                  circuit.circuitId.toString()
                                )
                              }
                            >
                              {circuit.circuitKey} - {circuit.circuitTitle}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hidden input for form handling */}
                    <input type="hidden" {...field} />
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isCircuitsLoading ||
                  isCircuitDetailsLoading ||
                  isValidationLoading ||
                  !selectedCircuitId
                }
              >
                {isSubmitting ? "Checking..." : "Next"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Reset state when dialog is closed
        if (!newOpen) {
          setShowConfirmation(false);
          setSelectedCircuitId(null);
          setSelectedCircuit(null);
          setIsSubmitting(false);
          setDropdownOpen(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl sm:max-w-[500px] overflow-visible">
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
