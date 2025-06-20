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
import { AlertTriangle, AlertCircle, ChevronRight } from "lucide-react";
import circuitService from "@/services/circuitService";
import { toast } from "sonner";

interface CircuitDeactivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: Circuit;
  onDeactivate: () => void;
}

const CircuitDeactivationDialog = ({
  isOpen,
  onClose,
  circuit,
  onDeactivate,
}: CircuitDeactivationDialogProps) => {
  const [circuitStatuses, setCircuitStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{isUsed: boolean, documentCount: number} | null>(null);

  useEffect(() => {
    if (isOpen && circuit?.id) {
      loadCircuitData();
    }
  }, [isOpen, circuit]);

  const loadCircuitData = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Load statuses and check circuit usage
      const [statuses, usage] = await Promise.all([
        circuitService.getCircuitStatuses(circuit.id),
        checkCircuitDocumentUsage(circuit.id)
      ]);
      setCircuitStatuses(statuses);
      setUsageInfo(usage);
    } catch (error) {
      console.error("Error loading circuit data:", error);
      setHasError(true);
      toast.error("Failed to load circuit data");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom function to check if circuit has documents - works around backend limitation
  const checkCircuitDocumentUsage = async (circuitId: number): Promise<{isUsed: boolean, documentCount: number}> => {
    try {
      // First try the original endpoint, but handle the "not active" error gracefully
      try {
        const result = await circuitService.checkCircuitUsage(circuitId);
        return result;
      } catch (error: any) {
        // If it's the "not active" error, we need an alternative approach
        if (error.response?.status === 400 && error.response?.data?.includes('not active')) {
          console.log('Circuit is active, using alternative document check method');
          
          // Import the API client to check documents directly
          const { api } = await import('@/services/api/core');
          const response = await api.get('/Documents');
          const documents = response.data;
          const documentsWithCircuit = documents.filter((doc: any) => doc.circuitId === circuitId);
          
          return {
            isUsed: documentsWithCircuit.length > 0,
            documentCount: documentsWithCircuit.length
          };
        }
        throw error;
      }
    } catch (error) {
      console.error('Error checking circuit usage:', error);
      return { isUsed: false, documentCount: 0 };
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      await circuitService.toggleCircuitActivation(circuit);
      toast.success("Circuit deactivated successfully");
      onDeactivate();
      onClose();
    } catch (error) {
      console.error("Error deactivating circuit:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to deactivate circuit"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if circuit can be deactivated
  const canDeactivate = !isLoading && !hasError && usageInfo && !usageInfo.isUsed;

  // Don't render dialog if circuit is not available
  if (!circuit || !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Deactivate Circuit
          </DialogTitle>
          <DialogDescription>
            Review the circuit information before deactivation. Once deactivated,
            this circuit cannot be assigned to new documents.
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

            {/* Usage Warning */}
            <div className="bg-orange-950/40 rounded-md p-4 border border-orange-500/30 mb-4">
              <h3 className="text-lg font-medium text-orange-300 mb-2">
                Document Usage Check
              </h3>
              <div className="flex items-center gap-3">
                {usageInfo?.isUsed ? (
                  <>
                    <AlertTriangle className="text-red-400" size={24} />
                    <div>
                      <p className="font-medium text-red-300">
                        Cannot deactivate circuit
                      </p>
                      <p className="text-sm text-orange-400">
                        This circuit is currently assigned to {usageInfo.documentCount} document(s).
                        Please reassign or remove these documents first.
                      </p>
                    </div>
                  </>
                ) : usageInfo ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-green-900/40 border border-green-500/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                    <div>
                      <p className="font-medium text-green-300">
                        Safe to deactivate
                      </p>
                      <p className="text-sm text-orange-400">
                        No documents are currently assigned to this circuit.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-500/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    </div>
                    <div>
                      <p className="font-medium text-blue-300">
                        Checking document usage...
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Current Steps Configuration */}
            <div className="bg-blue-950/40 rounded-md p-4 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-medium text-blue-300 mb-2">
                Current Steps ({circuit?.steps?.length || 0})
              </h3>
              {circuit?.steps && circuit.steps.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {circuit.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-2 border border-blue-800/30 rounded bg-blue-900/20"
                    >
                      <div className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                        {step.orderIndex || index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-blue-100 text-sm truncate">{step.title}</div>
                        
                        {/* Status Transition */}
                        <div className="flex items-center gap-1 mt-1">
                          <Badge 
                            variant="outline" 
                            className="bg-orange-900/30 border-orange-500/40 text-orange-200 text-xs px-1 py-0"
                          >
                            {step.currentStatusTitle || "Unknown"}
                          </Badge>
                          <ChevronRight className="h-2 w-2 text-blue-400" />
                          <Badge 
                            variant="outline" 
                            className="bg-green-900/30 border-green-500/40 text-green-200 text-xs px-1 py-0"
                          >
                            {step.nextStatusTitle || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No steps configured</div>
              )}
              
              <div className="mt-3 pt-3 border-t border-blue-800/30">
                <div className="text-sm text-blue-400">
                  <span className="font-medium">{circuitStatuses.length}</span> statuses defined
                </div>
              </div>
            </div>

            {/* Deactivation Impact */}
            <div className="bg-yellow-950/40 rounded-md p-4 border border-yellow-500/30 mb-4">
              <h3 className="text-lg font-medium text-yellow-300 mb-2">
                Impact of Deactivation
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-200">
                <li>Circuit will not appear in document assignment options</li>
                <li>Existing documents using this circuit will continue to work</li>
                <li>Circuit configuration (steps, statuses) will be preserved</li>
                <li>Circuit can be reactivated later if needed</li>
              </ul>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDeactivate}
            disabled={isLoading || !canDeactivate}
            variant="destructive"
          >
            {isLoading ? "Deactivating..." : "Deactivate Circuit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CircuitDeactivationDialog; 