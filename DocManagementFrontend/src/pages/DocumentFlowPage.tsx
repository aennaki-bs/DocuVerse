import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import circuitService from "@/services/circuitService";
import { DocumentFlowHeader } from "@/components/circuits/document-flow/DocumentFlowHeader";
import { NoCircuitAssignedCard } from "@/components/circuits/document-flow/NoCircuitAssignedCard";
import { LoadingState } from "@/components/circuits/document-flow/LoadingState";
import { ErrorMessage } from "@/components/document-flow/ErrorMessage";
import { WorkflowHistorySection } from "@/components/document-flow/WorkflowHistorySection";
import { MoveDocumentButton } from "@/components/document-flow/MoveDocumentButton";
import { DocumentFlowMindMap } from "@/components/document-flow/DocumentFlowMindMap";
import { DocumentApprovalStatus } from "@/components/document-flow/DocumentApprovalStatus";
import { ApprovalHistoryComponent } from "@/components/document-workflow/ApprovalHistory";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  CircuitBoard,
  History,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentWorkflow } from "@/hooks/useDocumentWorkflow";
import { useDocumentApproval } from "@/hooks/document-workflow/useDocumentApproval";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const DocumentFlowPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSimpleUser = user?.role === "SimpleUser";
  const [approvalRefreshTrigger, setApprovalRefreshTrigger] = useState(0);
  const [mindMapRefreshTrigger, setMindMapRefreshTrigger] = useState(0);

  // Use the document flow hook to manage all workflow-related state and operations
  const {
    workflowStatus,
    isLoading: isLoadingWorkflow,
    isError: isWorkflowError,
    error: workflowError,
    refetch: refetchWorkflow,
    refreshAllData,
  } = useDocumentWorkflow(Number(id));

  // Use the document approval hook to check for pending approvals
  const {
    hasPendingApprovals,
    wasRejected,
  } = useDocumentApproval(Number(id));

  // Fetch the document information
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
  });

  // Fetch document circuit history
  const {
    data: circuitHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["document-circuit-history", Number(id)],
    queryFn: () => circuitService.getDocumentCircuitHistory(Number(id)),
    enabled: !!id,
  });

  // Handle move to status
  const handleMoveToStatus = (statusId: number) => {
    if (workflowStatus && statusId) {
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
        console.warn(`Could not resolve status title for ID ${statusId} in DocumentFlowPage, using fallback`);
      }
      
      const currentStatusTitle = workflowStatus.currentStatusTitle || 'Unknown Status';
      
      circuitService
        .moveToStatus(Number(id), statusId, `Moving from ${currentStatusTitle} to ${targetStatusTitle}`)
        .then((result) => {
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
          queryClient.invalidateQueries({ queryKey: ["document", Number(id)] });
        })
        .catch((error) => {
          console.error("Error moving document to status:", error);
          toast.error("Failed to update document status");
        });
    }
  };

  // Handle approval update
  const handleApprovalUpdate = () => {
    refreshAllData();
  };

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
      // Force refetch of document data with a small delay
      setTimeout(() => {
        // Re-trigger all data refresh to ensure consistency
        refreshAllData();
        // Trigger another mind map refresh after a delay to ensure backend is updated
        setMindMapRefreshTrigger(prev => prev + 1);
      }, 500);
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
      : "") ||
    (historyError instanceof Error
      ? historyError.message
      : historyError
      ? String(historyError)
      : "");

  // Overall loading state
  const isLoading = isLoadingDocument || isLoadingWorkflow || isLoadingHistory;

  if (!id) {
    navigate("/documents");
    return null;
  }

  // Check if the document has been loaded and doesn't have a circuit assigned
  const isNoCircuit = !isLoading && document && !document.circuitId;

  // If document is not in a circuit
  if (isNoCircuit) {
    return (
      <div className="p-2 sm:p-3 space-y-2 h-full">
        <DocumentFlowHeader
          documentId={id}
          document={document}
          navigateBack={() => navigate(`/documents/${id}`)}
        />

        <NoCircuitAssignedCard
          documentId={id}
          navigateToDocument={() => navigate(`/documents/${id}`)}
        />
      </div>
    );
  }

  const isCircuitCompleted = workflowStatus?.isCircuitCompleted;

  return (
    <div className="p-2 space-y-3 w-full">
      <DocumentFlowHeader
        documentId={id}
        document={document}
        navigateBack={() => navigate(`/documents/${id}`)}
      />

      <ErrorMessage error={errorMessage} />

      {/* Loading state */}
      {isLoading ? (
        <LoadingState />
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
                        isCircuitCompleted ? "text-green-400" : "text-blue-400"
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
                            workflowStatus.statuses.filter((s) => s.isComplete)
                              .length
                          }{" "}
                          of {workflowStatus.statuses.length} steps completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move Document Button - Only show if workflow completed and user has permission */}
                {workflowStatus?.isCircuitCompleted && !isSimpleUser && (
                  <MoveDocumentButton
                    documentId={Number(id)}
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
              documentId={Number(id)}
              onApprovalUpdate={handleApprovalUpdate}
              refreshTrigger={approvalRefreshTrigger}
            />
          </motion.div>

          {/* Main content area with tabs for different views */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="workflow" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="workflow">Workflow Steps</TabsTrigger>
                <TabsTrigger value="approvals">Approval History</TabsTrigger>
                <TabsTrigger value="activity">Activity History</TabsTrigger>
              </TabsList>

              <TabsContent value="workflow" className="mt-0">
                {/* Mind Map Visualization */}
                <DocumentFlowMindMap
                  workflowStatus={workflowStatus}
                  documentId={Number(id)}
                  onStatusComplete={refreshAllData}
                  onMoveToStatus={handleMoveToStatus}
                  hasPendingApprovals={hasPendingApprovals}
                  wasRejected={wasRejected}
                  refreshTrigger={mindMapRefreshTrigger}
                  onCloseWorkflow={() => navigate("/documents")}
                />
              </TabsContent>

              <TabsContent value="approvals" className="mt-0">
                <ApprovalHistoryComponent documentId={Number(id)} />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-white flex items-center">
                      <History className="h-5 w-5 mr-2 text-blue-400" />
                      Activity History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <WorkflowHistorySection
                      history={circuitHistory || []}
                      isLoading={isLoadingHistory}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DocumentFlowPage;
