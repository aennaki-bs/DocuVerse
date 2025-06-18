import { DocumentWorkflowStatus } from "@/models/documentCircuit";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircleCheck,
  CircleAlert,
  Clock,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import circuitService from "@/services/circuitService";
import approvalService from "@/services/approvalService";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface DocumentStatusCardProps {
  workflowStatus: DocumentWorkflowStatus;
  onStatusChange?: () => void;
}

export function DocumentStatusCard({
  workflowStatus,
  onStatusChange,
}: DocumentStatusCardProps) {
  const { user } = useAuth();
  const {
    status,
    statusText,
    currentStatusTitle,
    currentStatusId,
    isCircuitCompleted,
  } = workflowStatus;
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user is SimpleUser (read-only access)
  const isSimpleUser = user?.role === "SimpleUser";

  // Get the current status full details
  const currentStatusDetails = (workflowStatus.statuses || []).find(
    (s) => s.statusId === currentStatusId
  );

  // Fetch approval information
  const { data: approvalHistory, isLoading: isLoadingApprovals } = useQuery({
    queryKey: ["approvalHistory", workflowStatus.documentId],
    queryFn: () =>
      approvalService.getApprovalHistory(workflowStatus.documentId),
    enabled: !!workflowStatus.documentId,
  });

  // Check if there are pending approvals
  const hasPendingApprovals = approvalHistory?.some((approval) => {
    const status = approval.status?.toLowerCase();
    return status === 'open' || status === 'inprogress' || status === 'pending';
  });

  // Check if document was rejected
  const wasRejected = approvalHistory?.some((approval) =>
    approval.status?.toLowerCase().includes("rejected")
  );

  // Determine status type for styling
  const getStatusColor = () => {
    if (wasRejected) return "bg-red-900/20 border-red-700/30";
    if (hasPendingApprovals) return "bg-amber-900/20 border-amber-700/30";
    if (isCircuitCompleted) return "bg-green-900/20 border-green-700/30";
    if (status === 3) return "bg-red-900/20 border-red-700/30"; // Rejected
    if (status === 1) return "bg-blue-900/20 border-blue-700/30"; // In progress
    return "bg-gray-900/20 border-gray-700/30"; // Default
  };

  const getStatusBadge = () => {
    if (wasRejected)
      return <Badge className="bg-red-700">Approval Rejected</Badge>;
    if (hasPendingApprovals)
      return <Badge className="bg-amber-600">Pending Approval</Badge>;
    if (isCircuitCompleted)
      return <Badge className="bg-green-700">Completed</Badge>;
    if (status === 3) return <Badge className="bg-red-700">Rejected</Badge>;
    if (status === 1) return <Badge className="bg-blue-700">In Progress</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };

  const getStatusIcon = () => {
    if (wasRejected) return <AlertCircle className="h-7 w-7 text-red-500" />;
    if (hasPendingApprovals)
      return <Clock className="h-7 w-7 text-amber-500" />;
    if (isCircuitCompleted)
      return <CircleCheck className="h-7 w-7 text-green-500" />;
    if (status === 3) return <CircleAlert className="h-7 w-7 text-red-500" />;
    if (status === 1) return <Clock className="h-7 w-7 text-blue-500" />;
    return <Info className="h-7 w-7 text-gray-500" />;
  };

  // Handle status completion toggle
  const handleStatusToggle = async (statusId: number, isComplete: boolean) => {
    if (!workflowStatus || isUpdating || isSimpleUser) return;

    setIsUpdating(true);
    try {
      await circuitService.completeStatus({
        documentId: workflowStatus.documentId,
        statusId: statusId,
        isComplete: isComplete,
        comments: isComplete
          ? "Status marked as complete"
          : "Status marked as incomplete",
      });

      toast.success(
        `Status ${isComplete ? "completed" : "reopened"} successfully`
      );

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={`${getStatusColor()} overflow-hidden border-b border-t border-l border-r`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-white">
              Document Status
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Current status information
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">{getStatusBadge()}</div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getStatusIcon()}</div>

          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white tracking-tight">
              {currentStatusTitle || "No Status"}
            </h3>
            <p className="text-sm text-gray-400">
              {wasRejected
                ? "This document has been rejected. Please check the approval history for details."
                : hasPendingApprovals
                ? "This document is waiting for approval before it can proceed."
                : statusText}
            </p>
          </div>
        </div>

        {currentStatusDetails && (
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            {currentStatusDetails.description && (
              <div className="col-span-2">
                <p className="text-gray-300">
                  {currentStatusDetails.description}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">
                {currentStatusDetails.isInitial
                  ? "Initial"
                  : currentStatusDetails.isFinal
                  ? "Final"
                  : "Intermediate"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Required:</span>
              <span className="text-white">
                {currentStatusDetails.isRequired ? "Yes" : "No"}
              </span>
            </div>

            {/* Status completion toggle - only show if not rejected and not pending approval */}
            {!wasRejected && !hasPendingApprovals && (
              <div className="col-span-2 mt-2 flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`status-${currentStatusDetails.statusId}`}
                          checked={currentStatusDetails.isComplete}
                          onCheckedChange={
                            isSimpleUser 
                              ? undefined 
                              : (checked) => {
                                  handleStatusToggle(
                                    currentStatusDetails.statusId,
                                    !!checked
                                  );
                                }
                          }
                          disabled={isUpdating || isSimpleUser}
                        />
                        <label
                          htmlFor={`status-${currentStatusDetails.statusId}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white ${
                            isSimpleUser ? "cursor-default" : "cursor-pointer"
                          }`}
                        >
                          {isSimpleUser 
                            ? `Status: ${currentStatusDetails.isComplete ? "Complete" : "In Progress"}`
                            : `Mark as ${currentStatusDetails.isComplete ? "incomplete" : "complete"}`
                          }
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isSimpleUser
                          ? "Read-only access: You can view but cannot change the status"
                          : currentStatusDetails.isComplete
                          ? "Mark this status as incomplete"
                          : "Mark this status as complete"
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
