
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect } from 'react';
import api from '@/services/api';
import { DocumentStatus } from '@/models/documentCircuit';

export function useStepStatuses(stepId: number) {
  const queryClient = useQueryClient();

  const { 
    data: statuses,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['document-step-statuses', stepId],
    queryFn: () => api.get(`/Status/step/${stepId}`).then(res => res.data),
    enabled: !!stepId,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData ?? [],
    meta: {
      onSettled: (data, err) => {
        if (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to load step statuses.';
          console.error('Step statuses error:', err);
          toast.error(errorMessage);
        }
      }
    }
  });

  // Force a background refetch when the component mounts
  useEffect(() => {
    if (stepId) {
      queryClient.invalidateQueries({ 
        queryKey: ['document-step-statuses', stepId],
      });
    }
  }, [stepId, queryClient]);

  return {
    statuses,
    isLoading,
    isError,
    error,
    refetch
  };
}
