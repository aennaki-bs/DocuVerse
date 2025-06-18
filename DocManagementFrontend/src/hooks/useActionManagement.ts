import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Action, CreateActionDto, UpdateActionDto } from '@/models/action';
import { actionService } from '@/services/actionService';
import { toast } from '@/components/ui/use-toast';

export function useActionManagement() {
  const queryClient = useQueryClient();
  const queryKey = ['actions'];

  const { data: actions = [], isLoading } = useQuery({
    queryKey,
    queryFn: actionService.getActions,
  });

  const createActionMutation = useMutation({
    mutationFn: actionService.createAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Failed to create action:', error);
    },
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateActionDto }) =>
      actionService.updateAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Failed to update action:', error);
    },
  });

  const deleteActionMutation = useMutation({
    mutationFn: actionService.deleteAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Failed to delete action:', error);
    },
  });

  const toggleActionStatusMutation = useMutation({
    mutationFn: actionService.toggleActionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      console.error('Failed to update action status:', error);
    },
  });

  return {
    actions,
    isLoading,
    createAction: createActionMutation.mutateAsync,
    updateAction: updateActionMutation.mutateAsync,
    deleteAction: deleteActionMutation.mutateAsync,
    toggleActionStatus: toggleActionStatusMutation.mutateAsync,
  };
}
