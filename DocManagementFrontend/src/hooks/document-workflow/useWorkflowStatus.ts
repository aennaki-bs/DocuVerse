import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';
import { DocumentWorkflowStatus } from '@/models/documentCircuit';

export function useWorkflowStatus(documentId: number, enabled: boolean = true) {
  const { 
    data: workflowStatus, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['document-workflow', documentId],
    queryFn: () => circuitService.getDocumentCurrentStatus(documentId),
    enabled: !!documentId && enabled,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to load document workflow status.';
          console.error('Document workflow error:', err);
          toast.error(errorMessage);
        }
      }
    }
  });

  return {
    workflowStatus,
    isLoading,
    isError,
    error,
    refetch
  };
}
