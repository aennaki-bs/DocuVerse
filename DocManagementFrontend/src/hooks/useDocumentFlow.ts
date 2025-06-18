
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import circuitService from '@/services/circuitService';

type DialogType = 'move' | 'process' | 'nextStep';

interface DialogState {
  moveOpen: boolean;
  processOpen: boolean;
  nextStepOpen: boolean;
}

export function useDocumentFlow(documentId: string | undefined) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    moveOpen: false,
    processOpen: false,
    nextStepOpen: false
  });

  // Fetch document data
  const { 
    data: document, 
    isLoading: isLoadingDocument, 
    refetch: refetchDocument, 
    error: documentError 
  } = useQuery({
    queryKey: ['document', Number(documentId)],
    queryFn: () => documentService.getDocumentById(Number(documentId)),
    enabled: !!documentId,
    staleTime: 30000,
    gcTime: 300000,
  });

  // Fetch workflow status
  const { 
    data: workflowStatus, 
    isLoading: isLoadingWorkflow, 
    refetch: refetchWorkflow, 
    error: workflowError 
  } = useQuery({
    queryKey: ['document-workflow-status', Number(documentId)],
    queryFn: () => circuitService.getDocumentCurrentStatus(Number(documentId)),
    enabled: !!documentId,
    staleTime: 30000,
    gcTime: 300000,
  });

  // Fetch circuit details
  const { 
    data: circuitDetails, 
    isLoading: isLoadingCircuitDetails, 
    error: circuitDetailsError,
    refetch: refetchCircuitDetails
  } = useQuery({
    queryKey: ['circuit-details', document?.circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(document?.circuitId || 0),
    enabled: !!document?.circuitId,
    staleTime: 60000,
    gcTime: 300000,
  });

  // Fetch document circuit history
  const {
    data: circuitHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    error: historyError
  } = useQuery({
    queryKey: ['document-circuit-history', Number(documentId)],
    queryFn: () => circuitService.getDocumentCircuitHistory(Number(documentId)),
    enabled: !!documentId,
    staleTime: 30000,
    gcTime: 300000,
  });

  // Collect any errors
  const allErrors = [documentError, circuitDetailsError, historyError, workflowError].filter(Boolean);
  
  const openDialog = (type: DialogType) => {
    setDialogState(prev => ({
      ...prev,
      [`${type}Open`]: true
    }));
  };

  const closeDialog = (type: DialogType) => {
    setDialogState(prev => ({
      ...prev,
      [`${type}Open`]: false
    }));
  };

  const handleSuccess = (type: DialogType) => {
    refetchData();
    
    const messages = {
      move: "Document moved successfully",
      process: "Document step processed successfully",
      nextStep: "Document moved to next step successfully"
    };
    
    toast.success(messages[type]);
    closeDialog(type);
  };

  const refetchData = () => {
    // Refresh all data without full page reload
    refetchDocument();
    refetchHistory();
    refetchWorkflow();
    if (document?.circuitId) {
      refetchCircuitDetails();
    }
    
    // Also invalidate related queries to ensure consistency
    queryClient.invalidateQueries({ 
      queryKey: ['pending-documents'],
    });
  };

  const isLoading = isLoadingDocument || isLoadingCircuitDetails || isLoadingHistory || isLoadingWorkflow;

  return {
    document,
    workflowStatus,
    circuitDetails,
    circuitHistory,
    isLoading,
    error: allErrors.length > 0 ? allErrors[0] : null,
    dialogState,
    openDialog,
    closeDialog,
    handleSuccess,
    refetchData
  };
}
