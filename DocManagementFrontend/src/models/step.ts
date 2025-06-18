export interface Step {
  id: number;
  stepKey: string;
  circuitId: number;
  title: string;
  descriptif: string;
  orderIndex: number;
  currentStatusId: number;
  currentStatusTitle?: string;
  nextStatusId: number;
  nextStatusTitle?: string;
  responsibleRoleId?: number;
  isFinalStep: boolean;
  requiresApproval: boolean;
  
  // Internal UI fields
  approvalUserId?: number;    // Used for UI selection flow
  approvalGroupId?: number;   // Used for UI selection flow
  
  // API fields for approval
  approvatorId?: number;      // Maps to approvalUserId for API
  approvatorsGroupId?: number; // Maps to approvalGroupId for API
}

export interface CreateStepDto {
  title: string;
  descriptif: string;
  orderIndex?: number;
  circuitId: number;
  currentStatusId: number;
  nextStatusId: number;
  responsibleRoleId?: number;
  isFinalStep: boolean;
  requiresApproval: boolean;
  
  // API fields for sending to backend
  approvatorId?: number;       // Individual user approver ID
  approvatorsGroupId?: number; // Group approver ID
}

export interface UpdateStepDto {
  title?: string;
  descriptif?: string;
  orderIndex?: number;
  circuitId?: number;
  currentStatusId?: number;
  nextStatusId?: number;
  responsibleRoleId?: number;
  isFinalStep?: boolean;
  requiresApproval?: boolean;
  
  // API fields for sending to backend
  approvatorId?: number;       // Individual user approver ID
  approvatorsGroupId?: number; // Group approver ID
} 