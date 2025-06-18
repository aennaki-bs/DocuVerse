import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import documentService from "@/services/documentService";
import workflowService from "@/services/workflowService";
import approvalService from "@/services/approvalService";

// Component imports
import DocumentTitle from "@/components/document/DocumentTitle";
import DocumentActions from "@/components/document/DocumentActions";
import DocumentTabsView from "@/components/document/DocumentTabsView";
import DocumentLoadingState from "@/components/document/DocumentLoadingState";
import DocumentNotFoundCard from "@/components/document/DocumentNotFoundCard";
import DeleteDocumentDialog from "@/components/document/DeleteDocumentDialog";

const ViewDocument = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Check if user has permissions to edit/delete documents
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Fetch document details
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
  });

  // Fetch workflow status for this document
  const {
    data: workflowStatus,
    isLoading: isLoadingWorkflow,
    error: workflowError
  } = useQuery({
    queryKey: ["documentWorkflow", Number(id)],
    queryFn: () => workflowService.getDocumentWorkflowStatus(Number(id)),
    enabled: !!id && !!document?.circuitId,
    retry: false,  // Don't retry if the document isn't in a workflow
  });

  // Fetch approval history for this document
  const {
    data: approvalHistory,
    isLoading: isLoadingApprovalHistory,
    error: approvalHistoryError
  } = useQuery({
    queryKey: ["documentApprovalHistory", Number(id)],
    queryFn: () => approvalService.getApprovalHistory(Number(id)),
    enabled: !!id,
    retry: false,
  });
  
  // Fetch pending approvals for this document
  const {
    data: pendingApprovals,
    isLoading: isLoadingApproval,
    error: approvalError
  } = useQuery({
    queryKey: ["documentApprovals", Number(id)],
    queryFn: () => approvalService.getDocumentApprovals(Number(id)),
    enabled: !!id,
    retry: false,
  });

  // Fetch lignes for this document
  const {
    data: lignes = [],
    isLoading: isLoadingLignes,
    error: lignesError,
  } = useQuery({
    queryKey: ["documentLignes", Number(id)],
    queryFn: () => documentService.getLignesByDocumentId(Number(id)),
    enabled: !!id,
  });

  // Handle errors from queries using useEffect
  useEffect(() => {
    if (documentError) {
      console.error(`Failed to fetch document with ID ${id}:`, documentError);
      toast.error("Failed to load document");
      navigate("/documents");
    }

    if (lignesError) {
      console.error(`Failed to fetch lignes for document ${id}:`, lignesError);
      toast.error("Failed to load document lignes");
    }

    if (workflowError && document?.circuitId) {
      console.error(`Failed to fetch workflow status for document ${id}:`, workflowError);
      toast.error("Failed to load workflow status");
    }

    if (approvalHistoryError) {
      console.error(`Failed to fetch approval history for document ${id}:`, approvalHistoryError);
      // Don't show error toast for approval history as it might not exist for all documents
    }
    
    if (approvalError) {
      console.error(`Failed to fetch pending approvals for document ${id}:`, approvalError);
      // Don't show error toast for pending approvals as it might not exist for all documents
    }
  }, [documentError, lignesError, workflowError, approvalError, approvalHistoryError, id, navigate, document]);

  const handleDelete = async () => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to delete documents");
      return;
    }

    try {
      if (document) {
        await documentService.deleteDocument(document.id);
        toast.success("Document deleted successfully");
        navigate("/documents");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Add a method to handle navigation to document flow
  const handleDocumentFlow = () => {
    if (document) {
      navigate(`/documents/${document.id}/flow`);
    }
  };

  // Handle workflow updates - refresh all document-related data
  const handleWorkflowUpdate = () => {
    // Invalidate and refetch all document-related queries
    queryClient.invalidateQueries({ queryKey: ["document", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentWorkflow", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentApprovalHistory", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentApprovals", Number(id)] });
    queryClient.invalidateQueries({ queryKey: ["documentLignes", Number(id)] });
    
    // Also invalidate the documents list for when user navigates back
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  if (!id) {
    navigate("/documents");
    return null;
  }

  // Find active approval - prefer direct pending approvals query result
  const directPendingApproval = pendingApprovals && pendingApprovals.length > 0 
    ? pendingApprovals[0] 
    : undefined;
  
  // Fallback to approval history if direct pending approvals query returned nothing
  const historyPendingApproval = !directPendingApproval 
    ? approvalHistory?.find(approval =>
        approval.status === "Pending" ||
        approval.status === "InProgress" ||
        approval.status === "Waiting" ||
        approval.status.toLowerCase().includes("wait") ||
        approval.status.toLowerCase().includes("progress")
      ) 
    : undefined;

  // If there's no explicit pending approval but workflow has status, create a synthetic one
  const syntheticApproval = !directPendingApproval && !historyPendingApproval &&
    workflowStatus?.currentStatusTitle && workflowStatus?.currentStepId && workflowStatus?.currentStepRequiresApproval
      ? {
          approvalId: 0,
          documentId: Number(id),
          documentKey: document?.documentKey || '',
          documentTitle: document?.title || '',
          stepId: workflowStatus.currentStepId,
          stepTitle: workflowStatus.currentStatusTitle,
          assignedTo: "Approval Required",
          status: "Waiting",
          createdAt: new Date().toISOString(),
          isRequired: true
        } 
      : undefined;

  // Use the most specific approval information available
  const effectiveApproval = directPendingApproval || historyPendingApproval || syntheticApproval;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-950/30">
      {/* Main Content */}
      <motion.main
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <DocumentTitle document={document} isLoading={isLoadingDocument} />

          {document && (
            <DocumentActions
              document={document}
              canManageDocuments={canManageDocuments}
              onDelete={() => setDeleteDialogOpen(true)}
              onDocumentFlow={handleDocumentFlow}
              onWorkflowUpdate={handleWorkflowUpdate}
            />
          )}
        </motion.div>

        {isLoadingDocument ? (
          <motion.div variants={itemVariants}>
            <DocumentLoadingState />
          </motion.div>
        ) : document ? (
          <motion.div variants={itemVariants} className="mb-6">
            <DocumentTabsView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              document={document}
              lignes={lignes}
              canManageDocuments={canManageDocuments}
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
              workflowStatus={workflowStatus}
              isLoadingWorkflow={isLoadingWorkflow}
              pendingApproval={effectiveApproval}
              approvalHistory={approvalHistory}
              isLoadingApproval={isLoadingApproval}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <DocumentNotFoundCard />
          </motion.div>
        )}
      </motion.main>

      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ViewDocument;
