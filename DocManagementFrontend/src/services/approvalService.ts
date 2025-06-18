import api from './api/core';
import { 
  ApprovalGroup, 
  CreateApprovalGroupRequest, 
  ApproverInfo,
  PendingApproval,
  ApprovalResponse,
  ApprovalResponsePayload,
  ApprovalHistory,
  DocumentToApprove,
  ApprovalRuleType,
  GroupAssociationDto,
  StepApprovalConfigDetailDto
} from '@/models/approval';

// Approvator (individual approver) interface
interface Approvator {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

// Create approvator request interface
interface CreateApprovatorRequest {
  userId: number;
  stepId?: number;
  comment?: string;
}

// Step approval configuration interface
interface StepApprovalConfigDto {
  requiresApproval: boolean;
  approvalType?: string;
  singleApproverId?: number;
  groupApproverIds?: number[];
  groupName?: string;
  ruleType?: string;
  comment?: string;
}

export interface ApprovalInfo {
  approvalId: number;
  documentId: number;
  documentKey: string;
  documentTitle: string;
  stepId: number;
  stepTitle: string;
  assignedTo: string;
  assignedToGroup?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  processedBy?: string;
  processedAt?: string;
  comments?: string;
  isRequired: boolean;
}

export interface ApprovalResponseHistoryDto {
  responderName: string;
  responseDate: string;
  isApproved: boolean;
  comments: string;
}

export interface ApprovalHistoryItem extends ApprovalInfo {
  decisionMadeBy?: string;
  decisionMadeAt?: string;
  decision?: string;
  responses?: ApprovalResponseHistoryDto[];
}

export interface ApproversGroup {
  id: number;
  name: string;
  comment?: string;
  ruleType: string;
  approvers?: ApproverInfo[];
}

export interface GroupAssociation {
  groupId: number;
  groupName: string;
  isAssociated: boolean;
  associatedSteps: {
    stepId: number;
    stepKey: string;
    title: string;
    circuitId: number;
    circuitTitle: string;
  }[];
}

const approvalService = {
  // Get all approval groups
  getAllApprovalGroups: async (): Promise<ApprovalGroup[]> => {
    try {
      const response = await api.get('/Approval/groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching approval groups:', error);
      throw error;
    }
  },

  // Get approval group by ID
  getApprovalGroupById: async (id: number): Promise<ApprovalGroup> => {
    try {
      const response = await api.get(`/Approval/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval group with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new approval group
  createApprovalGroup: async (group: { 
    name: string, 
    comment?: string, 
    userIds: number[], 
    ruleType: string 
  }): Promise<void> => {
    try {
      // Check if userIds array exists and has entries
      if (!group.userIds || group.userIds.length === 0) {
        console.warn('Creating approval group with no users');
      }
      
      // Define payload type with optional users property
      type GroupPayload = {
        name: string;
        comment?: string;
        userIds: number[];
        ruleType: string;
        users?: { userId: number; orderIndex: number }[];
      };
      
      // For sequential approval type, we include orderIndex information
      // For API compatibility, maintain the original userIds array
      const payload: GroupPayload = { 
        ...group
      };
      
      // Only for Sequential rule type, add the ordered users array
      if (group.ruleType === 'Sequential' && group.userIds.length > 0) {
        payload.users = group.userIds.map((userId, index) => ({
          userId,
          orderIndex: index
        }));
      }
      
      await api.post('/Approval/groups', payload);
    } catch (error) {
      console.error('Error creating approval group:', error);
      throw error;
    }
  },

  // Update existing approval group (remove and recreate)
  updateApprovalGroup: async (id: number, group: { 
    name: string, 
    comment?: string, 
    userIds: number[], 
    ruleType: string 
  }): Promise<void> => {
    try {
      // Since there's no specific update endpoint, we need to:
      // 1. Delete the existing group
      // 2. Create a new group with the updated data
      await api.delete(`/Approval/groups/${id}`);
      
      // Check if userIds array exists and has entries
      if (!group.userIds || group.userIds.length === 0) {
        console.warn('Updating approval group with no users');
      }
      
      // Define payload type with optional users property
      type GroupPayload = {
        name: string;
        comment?: string;
        userIds: number[];
        ruleType: string;
        users?: { userId: number; orderIndex: number }[];
      };
      
      // For sequential approval type, we include orderIndex information
      // For API compatibility, maintain the original userIds array
      const payload: GroupPayload = { 
        ...group
      };
      
      // Only for Sequential rule type, add the ordered users array
      if (group.ruleType === 'Sequential' && group.userIds.length > 0) {
        payload.users = group.userIds.map((userId, index) => ({
          userId,
          orderIndex: index
        }));
      }
      
      await api.post('/Approval/groups', payload);
    } catch (error) {
      console.error(`Error updating approval group with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete approval group
  deleteApprovalGroup: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Approval/groups/${id}`);
    } catch (error) {
      console.error(`Error deleting approval group with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all eligible approvers (users who can be added to groups)
  getEligibleApprovers: async (): Promise<ApproverInfo[]> => {
    try {
      const response = await api.get('/Approval/eligible-approvers');
      return response.data;
    } catch (error) {
      console.error('Error fetching eligible approvers:', error);
      throw error;
    }
  },

  // Get users who can be assigned as approvers (not already in the approvers table)
  getAvailableApprovers: async (): Promise<ApproverInfo[]> => {
    try {
      const response = await api.get('/Approval/available-approvers');
      return response.data;
    } catch (error) {
      console.error('Error fetching available approvers:', error);
      throw error;
    }
  },

  // Get members of a specific group
  getGroupMembers: async (groupId: number): Promise<ApproverInfo[]> => {
    try {
      const response = await api.get(`/Approval/groups/${groupId}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for group ID ${groupId}:`, error);
      throw error;
    }
  },

  // Add user to group
  addUserToGroup: async (groupId: number, userId: number, orderIndex?: number): Promise<void> => {
    try {
      await api.post(`/Approval/groups/${groupId}/users`, { userId, orderIndex });
    } catch (error) {
      console.error(`Error adding user ${userId} to group ${groupId}:`, error);
      throw error;
    }
  },

  // Remove user from group
  removeUserFromGroup: async (groupId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/Approval/groups/${groupId}/users/${userId}`);
    } catch (error) {
      console.error(`Error removing user ${userId} from group ${groupId}:`, error);
      throw error;
    }
  },

  // Get all approvators (individual approvers)
  getAllApprovators: async (): Promise<Approvator[]> => {
    try {
      const response = await api.get('/Approval/approvators');
      return response.data;
    } catch (error) {
      console.error('Error fetching approvators:', error);
      throw error;
    }
  },

  // Get approvator by ID
  getApprovatorById: async (id: number): Promise<Approvator> => {
    try {
      const response = await api.get(`/Approval/approvators/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approvator with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new approvator
  createApprovator: async (approvator: CreateApprovatorRequest): Promise<Approvator> => {
    try {
      const response = await api.post('/Approval/approvators', approvator);
      return response.data;
    } catch (error) {
      console.error('Error creating approvator:', error);
      throw error;
    }
  },

  // Update existing approvator
  updateApprovator: async (id: number, approvator: CreateApprovatorRequest): Promise<void> => {
    try {
      await api.put(`/Approval/approvators/${id}`, approvator);
    } catch (error) {
      console.error(`Error updating approvator with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete approvator
  deleteApprovator: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Approval/approvators/${id}`);
    } catch (error) {
      console.error(`Error deleting approvator with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all pending approvals
   */
  getPendingApprovals: async (): Promise<ApprovalInfo[]> => {
    try {
      const response = await api.get('/Approval/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },

  /**
   * Get pending approvals for a specific user
   */
  getPendingApprovalsForUser: async (userId: number): Promise<ApprovalInfo[]> => {
    try {
      const response = await api.get(`/Approval/pending/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pending approvals for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get approval history for a document
   */
  getApprovalHistory: async (documentId: number): Promise<ApprovalHistoryItem[]> => {
    try {
      const response = await api.get(`/Approval/history/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval history for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Get approval history for a user
   */
  getUserApprovalHistory: async (userId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/Approval/history/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval history for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get documents waiting for the current user's approval
   */
  getDocumentsToApprove: async (): Promise<ApprovalInfo[]> => {
    try {
      const response = await api.get('/Approval/documents-to-approve');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents to approve:', error);
      throw error;
    }
  },

  /**
   * Get a specific approval group
   */
  getApprovalGroup: async (groupId: number): Promise<ApproversGroup> => {
    try {
      const response = await api.get(`/Approval/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval group ${groupId}:`, error);
      throw error;
    }
  },

  /**
   * Check if a group is associated with any steps
   */
  checkGroupAssociation: async (groupId: number): Promise<GroupAssociation> => {
    try {
      const response = await api.get(`/Approval/groups/${groupId}/check-association`);
      return response.data;
    } catch (error) {
      console.error(`Error checking association for group ${groupId}:`, error);
      throw error;
    }
  },

  // Get steps with approval configuration
  getStepsWithApproval: async (): Promise<any[]> => {
    try {
      const response = await api.get('/Approval/configure/steps');
      return response.data;
    } catch (error) {
      console.error('Error fetching steps with approval configuration:', error);
      throw error;
    }
  },
  
  // Get step approval configuration
  getStepApprovalConfig: async (stepId: number): Promise<StepApprovalConfigDetailDto> => {
    try {
      const response = await api.get(`/Approval/configure/step/${stepId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval configuration for step ${stepId}:`, error);
      throw error;
    }
  },
  
  // Configure step approval
  configureStepApproval: async (stepId: number, config: {
    requiresApproval: boolean;
    approvalType?: string;
    singleApproverId?: number;
    approverName?: string;
    approvatorsGroupId?: number;
    groupName?: string;
    ruleType?: string;
    comment?: string;
  }): Promise<void> => {
    try {
      await api.post(`/Approval/configure/step/${stepId}`, config);
    } catch (error) {
      console.error(`Error configuring approval for step ${stepId}:`, error);
      throw error;
    }
  },

  // Get pending approvals for a specific document
  getDocumentApprovals: async (documentId: number): Promise<PendingApproval[]> => {
    try {
      const response = await api.get(`/Approval/document/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approvals for document ${documentId}:`, error);
      // Return empty array if API endpoint doesn't exist yet
      return [];
    }
  },

  // Get approval history for a specific document
  getDocumentApprovalHistory: async (documentId: number): Promise<ApprovalHistory[]> => {
    try {
      const response = await api.get(`/Approval/document/${documentId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching approval history for document ${documentId}:`, error);
      // Return empty array if API endpoint doesn't exist yet
      return [];
    }
  },

  /**
   * Get general approval history for all users and documents
   */
  getGeneralApprovalHistory: async (): Promise<any[]> => {
    try {
      const response = await api.get('/Approval/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching general approval history:', error);
      throw error;
    }
  },

  /**
   * Respond to an approval request
   */
  respondToApproval: async (
    approvalId: number, 
    data: { isApproved: boolean; comments?: string }
  ): Promise<any> => {
    try {
      const response = await api.post(`/Approval/${approvalId}/respond`, data);
      return response.data;
    } catch (error) {
      console.error(`Error responding to approval ${approvalId}:`, error);
      throw error;
    }
  },

  // Get waiting approvals (status: Open or InProgress)
  getWaitingApprovals: async (): Promise<any[]> => {
    try {
      const response = await api.get('/Approval/history/waiting');
      return response.data;
    } catch (error) {
      console.error('Error fetching waiting approvals:', error);
      throw error;
    }
  },

  // Get accepted approvals (status: Accepted)
  getAcceptedApprovals: async (): Promise<any[]> => {
    try {
      const response = await api.get('/Approval/history/accepted');
      return response.data;
    } catch (error) {
      console.error('Error fetching accepted approvals:', error);
      throw error;
    }
  },

  // Get rejected approvals (status: Rejected)
  getRejectedApprovals: async (): Promise<any[]> => {
    try {
      const response = await api.get('/Approval/history/rejected');
      return response.data;
    } catch (error) {
      console.error('Error fetching rejected approvals:', error);
      throw error;
    }
  },
};

export default approvalService; 