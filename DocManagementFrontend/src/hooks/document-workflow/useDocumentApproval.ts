import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import approvalService from '@/services/approvalService';
import { ApprovalHistory } from '@/models/approval';

export function useDocumentApproval(documentId: number) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch approval history for the document
  const { 
    data: approvalHistory,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory
  } = useQuery<ApprovalHistory[]>({
    queryKey: ['approvalHistory', documentId],
    queryFn: () => approvalService.getApprovalHistory(documentId),
    enabled: !!documentId,
  });

  // Respond to an approval request
  const respondToApproval = async (approvalId: number, isApproved: boolean, comments?: string) => {
    setIsLoading(true);
    try {
      await approvalService.respondToApproval(approvalId, {
        isApproved,
        comments
      });
      
      toast.success(`Document ${isApproved ? 'approved' : 'rejected'} successfully`);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['approvalHistory', documentId] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['documentWorkflowStatus', documentId] });
      
      return true;
    } catch (error) {
      console.error(`Error ${isApproved ? 'approving' : 'rejecting'} document:`, error);
      toast.error(`Failed to ${isApproved ? 'approve' : 'reject'} document. Please try again.`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if document has pending approvals
  const hasPendingApprovals = !!approvalHistory?.some(
    approval => {
      const status = approval.status?.toLowerCase();
      return status === 'open' || status === 'inprogress' || status === 'pending';
    }
  );

  // Get the latest approval status
  const latestApprovalStatus = approvalHistory?.[0]?.status;

  // Check if document was rejected - only look at most recent approval status
  const wasRejected = latestApprovalStatus?.toLowerCase() === 'rejected';

  return {
    approvalHistory,
    isHistoryLoading,
    isHistoryError,
    refetchHistory,
    respondToApproval,
    isLoading,
    hasPendingApprovals,
    latestApprovalStatus,
    wasRejected
  };
} 