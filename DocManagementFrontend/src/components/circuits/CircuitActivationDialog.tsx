import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import circuitService from "@/services/circuitService";
import { toast } from "sonner";

interface CircuitActivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: Circuit;
  onActivate: () => void;
}

const CircuitActivationDialog = ({
  isOpen,
  onClose,
  circuit,
  onActivate,
}: CircuitActivationDialogProps) => {
  const [circuitStatuses, setCircuitStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen && circuit?.id) {
      loadCircuitData();
    }
  }, [isOpen, circuit]);

  const loadCircuitData = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Load statuses for the circuit
      const statuses = await circuitService.getCircuitStatuses(circuit.id);
      setCircuitStatuses(statuses);
    } catch (error) {
      console.error("Error loading circuit data:", error);
      setHasError(true);
      toast.error("Failed to load circuit data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await circuitService.toggleCircuitActivation(circuit);
      toast.success("Circuit activated successfully");
      onActivate();
      onClose();
    } catch (error) {
      console.error("Error activating circuit:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to activate circuit"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if circuit is ready for activation
  const isReadyForActivation =
    !isLoading &&
    !hasError &&
    circuit?.steps &&
    circuit.steps.length > 0 &&
    circuitStatuses.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activate Circuit</DialogTitle>
          <DialogDescription>
            Review the circuit configuration before activation. Once activated,
            this circuit can be assigned to documents.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-blue-300">
              Loading circuit data...
            </div>
          </div>
        ) : hasError ? (
          <div className="bg-red-900/30 p-4 rounded-md border border-red-500/50 my-4">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle size={18} />
              <span>Error loading circuit data. Please try again.</span>
            </div>
          </div>
        ) : (
          <>
            {/* Circuit Information */}
            <div className="bg-blue-950/40 rounded-md p-4 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-medium text-blue-300 mb-2">
                Circuit Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-blue-400">Code:</p>
                  <p className="font-medium">{circuit?.circuitKey}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-400">Title:</p>
                  <p className="font-medium">{circuit?.title}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-blue-400">Description:</p>
                  <p className="font-medium">
                    {circuit?.descriptif || "No description"}
                  </p>
                </div>
              </div>
            </div>

            {/* Statuses */}
            <div className="bg-blue-950/40 rounded-md p-4 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-medium text-blue-300 mb-2">
                Statuses ({circuitStatuses.length})
              </h3>
              {circuitStatuses.length > 0 ? (
                <div className="space-y-2">
                  {circuitStatuses.map((status, index) => (
                    <div
                      key={status.id || index}
                      className="flex items-center gap-2 p-2 border border-blue-800/30 rounded bg-blue-900/20"
                    >
                      <Badge
                        className={
                          status.isFinal ? "bg-purple-700" : "bg-blue-700"
                        }
                      >
                        {status.isFinal
                          ? "Final"
                          : index === 0
                          ? "Initial"
                          : ""}
                      </Badge>
                      <span className="font-medium">{status.title}</span>
                      <span className="text-xs text-blue-400 ml-2">
                        {status.statusKey}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-300 flex items-center gap-2 p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
                  <AlertCircle size={16} />
                  <span>
                    No statuses defined for this circuit. At least one status is
                    recommended.
                  </span>
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="bg-blue-950/40 rounded-md p-4 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-medium text-blue-300 mb-2">
                Steps ({circuit?.steps?.length || 0})
              </h3>
              {circuit?.steps && circuit.steps.length > 0 ? (
                <div className="space-y-2">
                  {circuit.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 border border-blue-800/30 rounded bg-blue-900/20"
                    >
                      <div className="bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                        {step.orderIndex || index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-blue-100 mb-1">{step.title}</div>
                        
                        {/* Status Transition */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className="bg-orange-900/30 border-orange-500/40 text-orange-200 text-xs"
                          >
                            {step.currentStatusTitle || "Unknown"}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-blue-400" />
                          <Badge 
                            variant="outline" 
                            className="bg-green-900/30 border-green-500/40 text-green-200 text-xs"
                          >
                            {step.nextStatusTitle || "Unknown"}
                          </Badge>
                        </div>
                        
                        {step.descriptif && (
                          <div className="text-xs text-blue-400">
                            {step.descriptif}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {step.responsibleRole && (
                          <Badge className="bg-green-700 text-xs">
                            {step.responsibleRole.name}
                          </Badge>
                        )}
                        {step.isFinalStep && (
                          <Badge className="bg-purple-700 text-xs">Final</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-red-300 flex items-center gap-2 p-3 bg-red-900/20 rounded border border-red-500/30">
                  <AlertCircle size={16} />
                  <span>
                    No steps defined for this circuit. At least one step is
                    required.
                  </span>
                </div>
              )}
            </div>

            {/* Circuit Status */}
            <div className="bg-blue-950/40 rounded-md p-4 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-medium text-blue-300 mb-2">
                Circuit Ready for Activation
              </h3>
              <div className="flex items-center gap-3">
                {isReadyForActivation ? (
                  <>
                    <CheckCircle className="text-green-400" size={24} />
                    <div>
                      <p className="font-medium text-green-300">
                        Circuit is ready for activation
                      </p>
                      <p className="text-sm text-blue-400">
                        {circuit?.steps?.length || 0} step(s) defined,{" "}
                        {circuitStatuses.length} status(es) defined
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-yellow-400" size={24} />
                    <div>
                      <p className="font-medium text-yellow-300">
                        Circuit is not ready for activation
                      </p>
                      <p className="text-sm text-blue-400">
                        {!circuit?.steps || circuit.steps.length === 0
                          ? "At least one step is required"
                          : circuitStatuses.length === 0
                          ? "At least one status is recommended"
                          : "Please fix the errors above"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleActivate}
            disabled={isLoading || !isReadyForActivation}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? "Activating..." : "Activate Circuit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CircuitActivationDialog;
