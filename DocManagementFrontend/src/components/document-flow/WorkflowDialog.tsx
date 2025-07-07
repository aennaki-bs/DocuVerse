import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import circuitService from "@/services/circuitService";
import { DocumentFlowMindMap } from "./DocumentFlowMindMap";
import { MoveDocumentButton } from "./MoveDocumentButton";
import { useDocumentWorkflow } from "@/hooks/useDocumentWorkflow";
import { useDocumentApproval } from "@/hooks/document-workflow/useDocumentApproval";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircuitBoard, ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/circuits/document-flow/LoadingState";
import { NoCircuitAssignedCard } from "@/components/circuits/document-flow/NoCircuitAssignedCard";
import { ErrorMessage } from "./ErrorMessage";
import { DocumentApprovalStatus } from "@/components/document-flow/DocumentApprovalStatus";
import { ApprovalHistoryComponent } from '@/components/document-workflow/ApprovalHistory';
import { useErpArchivalDetection } from '@/hooks/useErpArchivalDetection';

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  onWorkflowUpdate?: () => void;
}

export function WorkflowDialog({
  open,
  onOpenChange,
  documentId,
  onWorkflowUpdate,
}: WorkflowDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSimpleUser = user?.role === "SimpleUser";
  const [approvalRefreshTrigger, setApprovalRefreshTrigger] = useState(0);
  const [mindMapRefreshTrigger, setMindMapRefreshTrigger] = useState(0);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const approvalHistoryRef = useRef<HTMLDivElement>(null);

  // Use the document flow hook to manage all workflow-related state and operations
  const {
    workflowStatus,
    isLoading: isLoadingWorkflow,
    isError: isWorkflowError,
    error: workflowError,
    refreshAllData,
  } = useDocumentWorkflow(documentId);

  // Use the document approval hook to check for pending approvals
  const {
    hasPendingApprovals,
    wasRejected,
  } = useDocumentApproval(documentId);

  // Use ERP archival detection hook
  const { startErpArchivalMonitoring } = useErpArchivalDetection();

  // Fetch the document information
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentService.getDocumentById(documentId),
    enabled: open && !!documentId, // Only fetch when dialog is open
  });

  // Handle move to status
  const handleMoveToStatus = async (statusId: number) => {
    if (workflowStatus && statusId) {
      // Get document before status change to check if it might trigger ERP archival
      const documentBeforeMove = document;
      
      // Find the status title from available transitions
      let targetStatus = workflowStatus.availableStatusTransitions?.find(
        s => s.statusId === statusId
      );
      let targetStatusTitle = targetStatus?.title;
      
      // If not found in available transitions, try to get from workflow statuses
      if (!targetStatusTitle && workflowStatus.statuses) {
        const workflowStatusInfo = workflowStatus.statuses.find(s => s.statusId === statusId);
        targetStatusTitle = workflowStatusInfo?.title;
      }
      
      // Final fallback to a more descriptive message
      if (!targetStatusTitle) {
        targetStatusTitle = `Target Status (ID: ${statusId})`;
        console.warn(`Could not resolve status title for ID ${statusId} in WorkflowDialog, using fallback`);
      }
      
      const currentStatusTitle = workflowStatus.currentStatusTitle || 'Unknown Status';
      
      try {
        const result = await circuitService.moveToStatus(documentId, statusId, `Moving from ${currentStatusTitle} to ${targetStatusTitle}`);
        
        // Only show one message based on the actual outcome
        if (result.requiresApproval) {
          // Only show approval message if approval is actually pending
          toast.info("This step requires approval. An approval request has been initiated.");
          // Trigger refresh of DocumentApprovalStatus
          setApprovalRefreshTrigger(prev => prev + 1);
        } else {
          // Show success message if the move completed (including auto-approvals)
          toast.success(result.message || "Document status updated successfully");
        }
        
        refreshAllData();
        
        // Invalidate documents list cache to refresh the main document view
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        queryClient.invalidateQueries({ queryKey: ["document", documentId] });

        // Check if this move might have triggered ERP archival
        if (documentBeforeMove && !documentBeforeMove.erpDocumentCode) {
          // Start checking for ERP archival completion
          setTimeout(() => {
            startErpArchivalMonitoring(documentId, documentBeforeMove, () => {
              refreshAllData();
              if (onWorkflowUpdate) {
                onWorkflowUpdate();
              }
            });
          }, 2000); // Wait 2 seconds before starting to poll
        }

        if (onWorkflowUpdate) {
          onWorkflowUpdate();
        }
      } catch (error) {
        console.error("Error moving document to status:", error);
        toast.error("Failed to update document status");
      }
    }
  };

  // Handle approval update
  const handleApprovalUpdate = () => {
    refreshAllData();
  };

  // Handle approval history toggle with scroll
  const handleToggleApprovalHistory = () => {
    setShowApprovalHistory(!showApprovalHistory);
  };

  // Scroll to approval history when it's shown
  useEffect(() => {
    if (showApprovalHistory && approvalHistoryRef.current && scrollContainerRef.current) {
      // Small delay to ensure the component is rendered and expanded
      setTimeout(() => {
        const container = scrollContainerRef.current;
        const historyElement = approvalHistoryRef.current;
        
        if (container && historyElement) {
          // Scroll the approval history into view
          historyElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          
          // Additional scroll to ensure full visibility
          setTimeout(() => {
            const containerRect = container.getBoundingClientRect();
            const historyRect = historyElement.getBoundingClientRect();
            
            // Calculate if we need additional scrolling
            const availableHeight = containerRect.height;
            const historyHeight = historyRect.height;
            
            // If history is taller than available space, scroll to show more
            if (historyHeight > availableHeight * 0.7) {
              container.scrollBy({
                top: historyHeight * 0.3,
                behavior: 'smooth'
              });
            }
          }, 300);
        }
      }, 200);
    }
  }, [showApprovalHistory]);

  // Handle status change from MoveDocumentButton
  const handleStatusChange = (result?: {
    requiresApproval?: boolean;
    approvalId?: number;
    success?: boolean;
    message?: string;
  }) => {
    if (result?.requiresApproval && result.approvalId) {
      // Trigger refresh of DocumentApprovalStatus
      setApprovalRefreshTrigger(prev => prev + 1);
    }
    
    // Refresh all workflow data
    refreshAllData();
    
    // Trigger refresh of the mind map (including next steps)
    setMindMapRefreshTrigger(prev => prev + 1);
    
    // Also refresh the document data to ensure we have the latest information
    // This is particularly important after a move operation
    if (result?.success || result?.message) {
      // Force refetch of document data
      setTimeout(() => {
        // Invalidate and refetch the document query
        queryClient.invalidateQueries({ queryKey: ["document", documentId] });
        // Trigger another mind map refresh after a delay to ensure backend is updated
        setMindMapRefreshTrigger(prev => prev + 1);
      }, 500);
    }

    if (onWorkflowUpdate) {
      onWorkflowUpdate();
    }
  };

  // Collect all errors
  const errorMessage =
    (documentError instanceof Error
      ? documentError.message
      : documentError
      ? String(documentError)
      : "") ||
    (workflowError instanceof Error
      ? workflowError.message
      : workflowError
      ? String(workflowError)
      : "");

  // Overall loading state
  const isLoading = isLoadingDocument || isLoadingWorkflow;

  // Check if the document has been loaded and doesn't have a circuit assigned
  const isNoCircuit = !isLoading && document && !document.circuitId;

  const isCircuitCompleted = workflowStatus?.isCircuitCompleted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-5xl p-0 ${showApprovalHistory ? 'max-h-[95vh]' : 'max-h-[90vh]'} overflow-hidden flex flex-col bg-[#0a1033]`}>
        <DialogHeader className="px-4 py-2 border-b border-blue-900/30">
          <div className="flex items-center">
            <div>
              <DialogTitle className="text-lg font-medium text-white">
                Document Workflow
              </DialogTitle>
              <DialogDescription className="text-blue-300/70">
                Document Code: {document?.documentKey || "Document workflow status"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div ref={scrollContainerRef} className="overflow-y-auto flex-1 p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
          <ErrorMessage error={errorMessage} />

          {/* Loading state */}
          {isLoading ? (
            <LoadingState />
          ) : isNoCircuit ? (
            <NoCircuitAssignedCard
              documentId={documentId}
              navigateToDocument={() => onOpenChange(false)}
            />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {/* Circuit Status Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <Card
                  className={cn(
                    "border overflow-hidden",
                    isCircuitCompleted
                      ? "border-green-500/30 bg-gradient-to-r from-green-900/20 to-blue-900/10"
                      : "border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/10"
                  )}
                >
                  <CardContent className="p-3 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-2 md:mb-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                          isCircuitCompleted
                            ? "bg-green-900/30 border border-green-500/30"
                            : "bg-blue-900/30 border border-blue-500/30"
                        )}
                      >
                        <CircuitBoard
                          className={cn(
                            "h-5 w-5",
                            isCircuitCompleted
                              ? "text-green-400"
                              : "text-blue-400"
                          )}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white">
                          {document?.circuit?.title || "Document Circuit"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCircuitCompleted ? "default" : "outline"}
                            className={
                              isCircuitCompleted
                                ? "bg-green-700 hover:bg-green-700 text-xs"
                                : "text-xs"
                            }
                          >
                            {isCircuitCompleted ? "Completed" : "In Progress"}
                          </Badge>
                          {workflowStatus && (
                            <span className="text-xs text-blue-300">
                              {
                                workflowStatus.statuses.filter(
                                  (s) => s.isComplete
                                ).length
                              }{" "}
                              of {workflowStatus.statuses.length} steps
                              completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Move Document Button - Only show if workflow completed and user has permission */}
                    {workflowStatus?.isCircuitCompleted && !isSimpleUser && (
                      <MoveDocumentButton
                        documentId={documentId}
                        onStatusChange={handleStatusChange}
                        disabled={hasPendingApprovals}
                        disabledReason={hasPendingApprovals ? "Document cannot be moved while approval is pending" : undefined}
                        transitions={
                          workflowStatus?.availableStatusTransitions || []
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Approval Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DocumentApprovalStatus
                  documentId={documentId}
                  onApprovalUpdate={handleApprovalUpdate}
                  refreshTrigger={approvalRefreshTrigger}
                  showApprovalHistory={showApprovalHistory}
                  onToggleApprovalHistory={handleToggleApprovalHistory}
                />
              </motion.div>

              {/* Approval History - Conditionally shown */}
              {showApprovalHistory && (
                <motion.div
                  ref={approvalHistoryRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="border-t border-blue-900/30 pt-4"
                >
                  <ApprovalHistoryComponent documentId={documentId} />
                </motion.div>
              )}

              {/* Main content area - Mind Map */}
              <div className="w-full">
                <DocumentFlowMindMap
                  workflowStatus={workflowStatus}
                  documentId={documentId}
                  onStatusComplete={refreshAllData}
                  onMoveToStatus={handleMoveToStatus}
                  hasPendingApprovals={hasPendingApprovals}
                  wasRejected={wasRejected}
                  refreshTrigger={mindMapRefreshTrigger}
                  onCloseWorkflow={() => onOpenChange(false)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-2 border-t border-blue-900/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
