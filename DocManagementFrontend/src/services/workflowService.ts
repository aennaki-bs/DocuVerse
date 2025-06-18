import api from './api';

export interface WorkflowStatus {
  documentId: number;
  documentKey: string;
  documentTitle: string;
  circuitId: number;
  circuitTitle: string;
  currentStatusId: number;
  currentStatusTitle: string;
  currentStepId: number | null;
  currentStepTitle: string;
  status: number;
  statusText: string;
  isCircuitCompleted: boolean;
  progressPercentage: number;
  statuses: WorkflowStatusItem[];
  stepHistory: any[];
  availableStatusTransitions: any[];
  availableActions: any[];
  canAdvanceToNextStep: boolean;
  canReturnToPreviousStep: boolean;
  isWaitingForApproval?: boolean;
  approvalInfo?: ApprovalInfo;
}

export interface WorkflowStatusItem {
  statusId: number;
  title: string;
  isRequired: boolean;
  isComplete: boolean;
  completedBy: string | null;
  completedAt: string | null;
}

export interface ApprovalInfo {
  processedBy?: string;
  approvator?: string;
  approversGroup?: string;
  approvalStatus?: string;
  waitingSince?: string;
}

const workflowService = {
  /**
   * Get the workflow status for a document
   * @param documentId The ID of the document
   * @returns WorkflowStatus object with circuit and status information
   */
  getDocumentWorkflowStatus: async (documentId: number): Promise<WorkflowStatus> => {
    try {
      const response = await api.get(`/Workflow/document/${documentId}/workflow-status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow status for document ${documentId}:`, error);
      throw error;
    }
  }
};

export default workflowService; 