import { DocumentWorkflowStatus, DocumentStatus, StatusDto } from '@/models/documentCircuit';
import { DocumentStatusCard } from './DocumentStatusCard';
import { useState } from 'react';
import { MoveDocumentButton } from './MoveDocumentButton';
import { useDocumentApproval } from '@/hooks/document-workflow/useDocumentApproval';
import { useAuth } from '@/context/AuthContext';

interface WorkflowStatusSectionProps {
  workflowStatus: DocumentWorkflowStatus | null | undefined;
  onWorkflowUpdate?: () => void;
  onMoveToStatus?: (statusId: number) => void;
}

export function WorkflowStatusSection({ 
  workflowStatus, 
  onWorkflowUpdate,
  onMoveToStatus
}: WorkflowStatusSectionProps) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Use the document approval hook to check for pending approvals
  const {
    hasPendingApprovals,
  } = useDocumentApproval(workflowStatus?.documentId || 0);

  // Check if user is SimpleUser (read-only access)
  const isSimpleUser = user?.role === "SimpleUser";

  if (!workflowStatus) return null;

  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
    if (onWorkflowUpdate) {
      onWorkflowUpdate();
    }
  };

  const handleMoveToStatus = (statusId: number) => {
    if (onMoveToStatus) {
      onMoveToStatus(statusId);
    }
  };

  // Determine if document status is complete and no pending approvals
  const isStatusComplete = workflowStatus.isCircuitCompleted;
  const isDisabled = !isStatusComplete || hasPendingApprovals || isSimpleUser;

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 gap-4">
        <DocumentStatusCard 
          workflowStatus={workflowStatus} 
          onStatusChange={handleStatusChange}
        />

        {!isSimpleUser && (
          <div className="mt-4">
            <MoveDocumentButton
              documentId={workflowStatus.documentId}
              onStatusChange={handleStatusChange}
              disabled={isDisabled}
              disabledReason={
                !isStatusComplete 
                  ? "You must mark the current status as complete before moving the document"
                  : hasPendingApprovals 
                  ? "Document cannot be moved while approval is pending"
                  : undefined
              }
              transitions={workflowStatus.availableStatusTransitions || []}
            />
          </div>
        )}

        {isSimpleUser && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-blue-300 text-sm text-center">
              📋 You have view-only access to this workflow. You can monitor the approval status and workflow progress but cannot make changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
