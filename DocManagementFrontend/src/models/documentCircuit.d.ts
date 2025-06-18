export interface DocumentCircuitHistory {
  id: number;
  documentId: number;
  circuitDetailId: number;
  processedByUserId: number;
  processedBy?: string;
  userName?: string;
  processedAt: string;
  comments: string;
  isApproved: boolean;
  circuitDetail?: {
    title: string;
    orderIndex: number;
  };
  actionTitle?: string;
  statusTitle?: string;
  stepTitle?: string;
  createdAt: string; // Adding the missing createdAt property
}

export interface DocumentStatus {
  statusId: number;
  title: string;
  isRequired: boolean;
  isComplete: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface DocumentWorkflowStatus {
  documentId: number;
  documentTitle: string;
  circuitId?: number;
  circuitTitle?: string;
  currentStepId?: number;
  currentStepTitle?: string;
  status: number;
  statusText: string;
  isCircuitCompleted: boolean;
  statuses: DocumentStatus[];
  availableActions: ActionDto[];
  canAdvanceToNextStep: boolean;
  canReturnToPreviousStep: boolean;
}

export interface ActionDto {
  actionId: number;
  actionKey?: string;
  title: string;
  description?: string;
}

export interface CompleteStatusDto {
  documentId: number;
  statusId: number;
  isComplete: boolean;
  comments: string;
}

export interface ProcessCircuitRequest {
  documentId: number;
  actionId: number;
  comments: string;
  isApproved: boolean;
}

export interface MoveDocumentStepRequest {
  documentId: number;
  comments?: string;
  currentStepId?: number;
}

export interface AssignCircuitRequest {
  documentId: number;
  circuitId: number;
  comments?: string;
}

export interface MoveToNextStepRequest {
  documentId: number;
  currentStepId: number;
  nextStepId: number;
  comments?: string;
}

export interface StatusEffectDto {
  statusId: number;
  setsComplete: boolean;
}

export interface AssignActionToStepDto {
  stepId: number;
  actionId: number;
  statusEffects?: StatusEffectDto[];
}
