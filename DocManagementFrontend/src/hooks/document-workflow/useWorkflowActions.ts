
import { useState } from 'react';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';
import { ProcessCircuitRequest } from '@/models/documentCircuit';

export function useWorkflowActions(documentId: number, onActionSuccess: () => void) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const performAction = async (actionId: number, comments: string = '', isApproved: boolean = true) => {
    if (!documentId) return;
    
    setIsActionLoading(true);
    try {
      const request: ProcessCircuitRequest = {
        documentId,
        actionId,
        comments,
        isApproved
      };
      
      await circuitService.performAction(request);
      toast.success(`Action ${isApproved ? 'approved' : 'rejected'} successfully`);
      onActionSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to perform action';
      toast.error(errorMessage);
      console.error('Error performing action:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    isActionLoading,
    performAction
  };
}
