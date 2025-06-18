import { useWorkflowStepStatuses } from "@/hooks/useWorkflowStepStatuses";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import circuitService from "@/services/circuitService";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface DocumentFlowMindMapProps {
  workflowStatus: any;
  documentId: number;
  onStatusComplete: () => void;
  onMoveToStatus: (statusId: number) => void;
  hasPendingApprovals?: boolean;
  wasRejected?: boolean;
  refreshTrigger?: number;
  onCloseWorkflow?: () => void;
}

interface NextStep {
  stepId: number;
  stepKey: string;
  title: string;
  description: string;
  currentStatusId: number;
  currentStatusTitle: string;
  nextStatusId: number;
  nextStatusTitle: string;
  isCurrentStep: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  requiresApproval: boolean;
}

export function DocumentFlowMindMap({
  workflowStatus,
  documentId,
  onStatusComplete,
  onMoveToStatus,
  hasPendingApprovals = false,
  wasRejected = false,
  refreshTrigger = 0,
  onCloseWorkflow,
}: DocumentFlowMindMapProps) {
  const { user } = useAuth();
  const { completeStatus } = useWorkflowStepStatuses(documentId);
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [processedStatuses, setProcessedStatuses] = useState<any[]>([]);
  const [requiresApproval, setRequiresApproval] = useState(false);

  // Check if user is SimpleUser (read-only access)
  const isSimpleUser = user?.role === "SimpleUser";

  const currentStatusId = workflowStatus?.currentStatusId;
  const currentStatus = workflowStatus?.statuses?.find(
    (s: any) => s.statusId === currentStatusId
  );

  // Extract processed statuses
  useEffect(() => {
    if (workflowStatus?.statuses) {
      const processed = workflowStatus.statuses.filter(
        (s: any) => s.isComplete && s.statusId !== currentStatusId
      );
      setProcessedStatuses(processed);
    }
  }, [workflowStatus?.statuses, currentStatusId]);

  // Check if current status requires approval
  useEffect(() => {
    if (workflowStatus?.currentStatusId) {
      // Only set approval status for already processed steps
      // This ensures we don't show approval status when just marking complete
      // Approval status should only show after clicking Move
      if (workflowStatus.message && workflowStatus.message.includes('approval')) {
        setRequiresApproval(true);
        return;
      }
      
      // Only consider a status as requiring approval if it has been explicitly
      // moved to that status (not just marked complete)
      const statusInfo = workflowStatus.availableStatusTransitions?.find(
        (s: any) => s.statusId === workflowStatus.currentStatusId
      );
      
      // Clear requiresApproval by default
      setRequiresApproval(false);
    }
  }, [workflowStatus, currentStatus]);

  // Fetch next available steps from current status
  useEffect(() => {
    const fetchNextSteps = async () => {
      if (currentStatusId && documentId) {
        try {
          // Get all document step statuses
          const allSteps = await circuitService.getDocumentStepStatuses(documentId);
          
          // Filter steps where the current status matches the document's current status
          // and the step is not completed yet
          const availableSteps = allSteps.filter((step: NextStep) => 
            step.currentStatusId === currentStatusId && !step.isCompleted
          );
          
          setNextSteps(availableSteps);
        } catch (error) {
          console.error("Error fetching next steps:", error);
          setNextSteps([]);
        }
      } else {
        setNextSteps([]);
      }
    };

    fetchNextSteps();
  }, [currentStatusId, documentId, refreshTrigger]);

  // Handle clicking on a next step
  const handleNextStepClick = async (step: NextStep) => {
    // Prevent SimpleUser from moving documents
    if (isSimpleUser) {
      toast.error("You don't have permission to move documents. You can only view the workflow status.");
      return;
    }
    
    try {
      // Call the parent's move function with the next status ID
      onMoveToStatus(step.nextStatusId);
      
      // Update local state for approval requirement (UI feedback only)
      if (step.requiresApproval) {
        setRequiresApproval(true);
      } else {
        setRequiresApproval(false);
      }

      // Call the onCloseWorkflow function if it's provided
      if (onCloseWorkflow) {
        onCloseWorkflow();
      }
    } catch (error) {
      console.error("Error moving to next step:", error);
      toast.error("Failed to move to next step");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Left column - Status History Stack */}
      <div className="lg:w-1/3">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Processed Status History
        </h3>

        <div className="space-y-3">
          {processedStatuses.length > 0 ? (
            processedStatuses.map((status, index) => (
              <motion.div
                key={status.statusId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card
                  className={cn(
                    "border border-green-500/30 bg-gradient-to-r from-green-900/20 to-blue-900/10 overflow-hidden",
                    "transform hover:-translate-y-1 transition-all duration-200"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-green-300">
                          {status.title}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-900/30 text-green-300 border-green-500/30"
                      >
                        Processed
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {status.completedAt && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(status.completedAt), "PPp")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <Card className="border border-blue-900/30 bg-blue-900/10 p-4">
              <p className="text-sm text-gray-400 text-center">
                No processed statuses yet
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Middle column - Current Status */}
      <div className="lg:w-1/3">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Current Status
        </h3>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full"
        >
          <Card
            className={cn(
              "border border-blue-500/50 bg-gradient-to-br from-blue-900/40 to-indigo-900/30 h-full",
              wasRejected &&
                "border-red-500/70 bg-gradient-to-br from-red-700/40 to-blue-900/20",
              !wasRejected && currentStatus?.isComplete && !requiresApproval && !hasPendingApprovals &&
                "border-green-500/50 bg-gradient-to-br from-green-900/30 to-blue-900/20",
              !wasRejected && (requiresApproval || hasPendingApprovals) &&
                "border-amber-500/70 bg-gradient-to-br from-amber-700/40 to-blue-900/20"
            )}
          >
            <CardContent className="p-6 flex flex-col items-center">
              {currentStatus ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                    {wasRejected ? (
                      <AlertCircle className="h-8 w-8 text-red-400" />
                    ) : currentStatus.isComplete ? (
                      (requiresApproval || hasPendingApprovals) ? (
                        <Clock className="h-8 w-8 text-amber-300" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      )
                    ) : (
                      <Circle className="h-8 w-8 text-blue-400" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 text-center">
                    {currentStatus.title}
                    {wasRejected ? (
                      <span className="text-red-300 ml-2">(Rejected)</span>
                    ) : (requiresApproval || hasPendingApprovals) && (
                      <span className="text-amber-300 ml-2">(Awaiting Approval)</span>
                    )}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant={currentStatus.isRequired ? "default" : "outline"}
                      className="mb-1"
                    >
                      {currentStatus.isRequired ? "Required" : "Optional"}
                    </Badge>

                    <Badge
                      variant={currentStatus.isComplete ? "default" : "outline"}
                      className={
                        wasRejected
                          ? "bg-red-600 hover:bg-red-600 text-white font-medium"
                          : currentStatus.isComplete && !requiresApproval && !hasPendingApprovals
                          ? "bg-green-700 hover:bg-green-700"
                          : (requiresApproval || hasPendingApprovals)
                          ? "bg-amber-500 hover:bg-amber-500 text-black font-medium"
                          : ""
                      }
                    >
                      {wasRejected
                        ? "Rejected"
                        : currentStatus.isComplete 
                        ? (requiresApproval || hasPendingApprovals) 
                          ? "Waiting for Approval" 
                          : "In Progress" 
                        : "In Progress"}
                    </Badge>
                  </div>

                  {(wasRejected || requiresApproval || hasPendingApprovals) && (
                    <p className={cn(
                      "text-sm font-medium border rounded-md p-2 mb-4 text-center",
                      wasRejected 
                        ? "text-red-300 border-red-500/30 bg-red-900/20"
                        : "text-amber-300 border-amber-500/30 bg-amber-900/20"
                    )}>
                      {wasRejected 
                        ? "This document was rejected. Please check the approval history for details."
                        : requiresApproval 
                        ? "This step requires approval. An approval request has been initiated."
                        : "This document is waiting for approval before it can proceed."
                      }
                    </p>
                  )}

                  {currentStatus.description && (
                    <p className="text-gray-300 text-sm mb-6 text-center">
                      {currentStatus.description}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No current status
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right column - Next Steps */}
      <div className="lg:w-1/3">
        <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
          <ArrowRight className="h-5 w-5 mr-2" />
          Next Steps
        </h3>

        <div className="space-y-3">
          {nextSteps && nextSteps.length > 0 ? (
            nextSteps.map((step, index) => (
              <motion.div
                key={step.stepId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/10 overflow-hidden",
                    "transform hover:-translate-y-1 hover:border-blue-400/50 transition-all duration-200",
                    hasPendingApprovals || isSimpleUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  onClick={() => {
                    if (!hasPendingApprovals && !isSimpleUser) {
                      handleNextStepClick(step);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <ArrowRight className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium text-blue-300">
                          {step.nextStatusTitle}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        disabled={hasPendingApprovals || isSimpleUser}
                        className={cn(
                          "bg-blue-600 hover:bg-blue-700",
                          step.requiresApproval && "bg-amber-600 hover:bg-amber-700",
                          (hasPendingApprovals || isSimpleUser) && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasPendingApprovals && !isSimpleUser) {
                            handleNextStepClick(step);
                          }
                        }}
                        title={
                          isSimpleUser 
                            ? "Read-only access: You can view but cannot move documents" 
                            : hasPendingApprovals 
                            ? "Document cannot be moved while approval is pending" 
                            : undefined
                        }
                      >
                        {isSimpleUser ? "View" : "Move"}
                      </Button>
                    </div>

                    {/* Code */}
                    <div className="text-sm text-gray-300 mb-2">
                      <span className="text-gray-400">Code:</span> {step.stepKey} ({step.title})
                    </div>

                    {/* Approval */}
                    <div className="text-sm">
                      <span className="text-gray-400">Approval:</span>{" "}
                      <span className={step.requiresApproval ? "text-amber-300" : "text-green-300"}>
                        {step.requiresApproval ? "Requires approval" : "No approval required"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border border-blue-900/30 bg-blue-900/10 p-4">
              <p className="text-sm text-gray-400 text-center">
                {currentStatus?.isComplete
                  ? "No next steps available"
                  : "Complete current status to see next steps"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
