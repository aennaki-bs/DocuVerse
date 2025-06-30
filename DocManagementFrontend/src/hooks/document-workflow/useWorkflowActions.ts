import { useState } from 'react';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';
import documentService from '@/services/documentService';
import { ProcessCircuitRequest } from '@/models/documentCircuit';
import { useErpArchivalDetection } from '@/hooks/useErpArchivalDetection';

export function useWorkflowActions(documentId: number, onActionSuccess: () => void) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { startErpArchivalMonitoring } = useErpArchivalDetection();

  const performAction = async (actionId: number, comments: string = '', isApproved: boolean = true) => {
    if (!documentId) return;
    
    setIsActionLoading(true);
    try {
      // Get document before action to check if it might trigger ERP archival
      const documentBeforeAction = await documentService.getDocumentById(documentId);
      
      const request: ProcessCircuitRequest = {
        documentId,
        actionId,
        comments,
        isApproved
      };
      
      await circuitService.performAction(request);
      toast.success(`Action ${isApproved ? 'approved' : 'rejected'} successfully`);
      
      // Check if this action might have triggered ERP archival
      // (document in final status but not yet archived)
      if (!documentBeforeAction.erpDocumentCode) {
        // Start checking for ERP archival completion
        setTimeout(() => {
          startErpArchivalMonitoring(documentId, documentBeforeAction, onActionSuccess);
        }, 2000); // Wait 2 seconds before starting to poll
      }
      
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
