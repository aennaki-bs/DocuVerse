// Basic user information for approvers
export interface ApproverInfo {
  id: number;
  userId: number;
  username: string;
  email?: string;
  role?: string;
}

/**
 * Enum for approval rule types
 */
export enum ApprovalRuleType {
  Any = 'Any',        // Any one approver can approve
  All = 'All',        // All approvers must approve
  Sequential = 'Sequential' // Approvers must approve in sequence
}

/**
 * Interface for approval group
 */
export interface ApprovalGroup {
  id: number;
  name: string;
  description?: string;
  comment?: string;
  stepTitle?: string;
  ruleType: string;
  approvers?: { userId: number; username: string }[];
  createdAt?: string;
  updatedAt?: string;
}

// Request to create a new approval group
export interface CreateApprovalGroupRequest {
  name: string;
  description?: string;
}

// Request to add user to an approval group
export interface AddUserToGroupRequest {
  userId: number;
}

/**
 * Interface for pending approval information
 */
export interface PendingApproval {
  approvalId: number;
  documentId: number;
  documentKey: string;
  documentTitle: string;
  stepId: number;
  stepTitle: string;
  requestedBy: string;
  requestDate: string;
  comments?: string;
  approvalType: string;
  status: string;
  assignedTo?: string;
  assignedToGroup?: string;
}

/**
 * Interface for approval response data
 */
export interface ApprovalResponse {
  approved: boolean;  // Used internally in our app
  comments?: string;
}

/**
 * Interface for API approval response payload
 */
export interface ApprovalResponsePayload {
  isApproved: boolean;  // API expects isApproved
  result: boolean;      // API also expects result field
  comments: string;
}

/**
 * Interface for approval history data
 */
export interface ApprovalHistory {
  approvalId: number;
  stepTitle: string;
  requestedBy: string;
  requestDate: string;
  status: string;
  comments?: string;
  responses: ApprovalResponseHistory[];
  // Legacy fields for backward compatibility
  id?: number;
  documentId?: number;
  documentTitle?: string;
  stepId?: number;
  requestedAt?: string;
  respondedBy?: string;
  respondedAt?: string;
  approved?: boolean;
}

/**
 * Interface for step approval configuration
 */
export interface StepApprovalConfig {
  requiresApproval: boolean;
  approvalType?: string;
  singleApproverId?: number;
  approvatorsGroupId?: number;
}

/**
 * Interface for configuring approval on a step
 */
export interface ConfigureStepApprovalRequest {
  requiresApproval: boolean;
  approvalType?: string;
  singleApproverId?: number;
  approvatorsGroupId?: number;
}

// Step in the multi-step form for creating a group
export interface ApprovalGroupFormStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

// Form data interface for creating approval groups
export interface ApprovalGroupFormData {
  name: string;
  comment?: string;
  selectedUsers: ApproverInfo[];
  ruleType: ApprovalRuleType;
}

// Approval response history interface
export interface ApprovalResponseHistory {
  responderName?: string;
  responseDate: string;
  isApproved: boolean;
  comments?: string;
}

// Document to approve interface
export interface DocumentToApprove {
  documentId: number;
  approvalId: number;
  documentKey?: string;
  title?: string;
  documentType?: string;
  subType?: string;
  createdBy?: string;
  createdAt: string;
  currentStep?: string;
  approvalType?: string;
  status?: string;
  requestedBy?: string;
  requestDate: string;
}

/**
 * Interface for approval configuration
 */
export interface ApprovalConfig {
  requiresApproval: boolean;
  approvalRuleType: ApprovalRuleType;
  isGroupApproval: boolean;
  groupId?: number;
  approverId?: number;
}

/**
 * Interface for assigning approval to a step
 */
export interface AssignApprovalRequest {
  stepId: number;
  requiresApproval: boolean;
  approvalRuleType?: ApprovalRuleType;
  isGroupApproval?: boolean;
  groupId?: number;
  approverId?: number;
}

/**
 * Interface for step reference in group association
 */
export interface StepReferenceDto {
  stepId: number;
  stepKey: string;
  title: string;
  circuitId: number;
  circuitTitle: string;
}

/**
 * Interface for step approval configuration detail response
 */
export interface StepApprovalConfigDetailDto {
  stepId: number;
  stepKey: string;
  circuitId: number;
  circuitTitle: string;
  title: string;
  descriptif: string;
  currentStatusId: number;
  currentStatusTitle: string;
  nextStatusId: number;
  nextStatusTitle: string;
  requiresApproval: boolean;
  approvalType: string;
  singleApproverId?: number;
  singleApproverName?: string;
  approvatorsGroupId?: number;
  groupApprovers?: {
    userId: number;
    username: string;
    role?: string;
    orderIndex?: number;
  }[];
  groupName?: string;
  ruleType?: string;
  comment: string;
}

/**
 * Interface for group association response
 */
export interface GroupAssociationDto {
  groupId: number;
  groupName: string;
  isAssociated: boolean;
  associatedSteps: StepReferenceDto[];
} 