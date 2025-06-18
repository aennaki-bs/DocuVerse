// Add the DocumentStatus type if it doesn't exist yet
export interface DocumentStatus {
  statusId: number;
  statusKey?: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isInitial?: boolean;
  isFinal?: boolean;
  isFlexible?: boolean;
  isComplete?: boolean;
  completedBy?: string;
  completedAt?: Date;
  circuitId?: number;
  transitionInfo?: string;
}

// Status completion/update request
export interface CompleteStatusDto {
  documentId: number;
  statusId: number;
  isComplete: boolean;
  comments: string;
}

// Document workflow status interface
export interface DocumentWorkflowStatus {
  documentId: number;
  documentTitle: string;
  circuitId?: number;
  circuitTitle?: string;
  currentStatusId?: number;
  currentStatusTitle?: string;
  currentStepId?: number;
  currentStepTitle?: string;
  status: number;
  statusText: string;
  isCircuitCompleted: boolean;
  statuses: DocumentStatus[];
  availableActions: ActionDto[];
  availableStatusTransitions: DocumentStatus[];
  canAdvanceToNextStep: boolean;
  canReturnToPreviousStep: boolean;
}

// Action DTO interface
export interface ActionDto {
  actionId: number;
  title: string;
  description: string;
}

// Document Circuit History interface
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
}

// Process circuit request
export interface ProcessCircuitRequest {
  documentId: number;
  actionId: number;
  comments: string;
  isApproved: boolean;
}

// Move document step request
export interface MoveDocumentStepRequest {
  documentId: number;
  comments?: string;
  currentStepId?: number;
  targetStepId?: number;
}

// Assign circuit request
export interface AssignCircuitRequest {
  documentId: number;
  circuitId: number;
  comments?: string;
}

// Move to next step request
export interface MoveToNextStepRequest {
  documentId: number;
  comments?: string;
}

// Status effect
export interface StatusEffectDto {
  statusId: number;
  setsComplete: boolean;
}

// Assign action to step
export interface AssignActionToStepDto {
  stepId: number;
  actionId: number;
  statusEffects?: StatusEffectDto[];
}

// Circuit validation interface
export interface CircuitValidation {
  isValid: boolean;
  errors: string[];
}

// Request to move a document to a specific status
export interface MoveToStatusRequest {
  documentId: number;
  targetStatusId: number;
  comments?: string;
}
