import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';

export function useStepManagement() {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteStep, isPending: isDeleting } = useMutation({
    mutationFn: async (stepId: number) => {
      try {
        const response = await api.delete(`/Circuit/steps/${stepId}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error('Step not found');
        }
        throw new Error('Failed to delete step');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['steps'] });
      toast.success('Step deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting step:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete step');
    }
  });

  return {
    deleteStep,
    isDeleting
  };
} 