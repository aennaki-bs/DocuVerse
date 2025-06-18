import { useQuery } from '@tanstack/react-query';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { actionService } from '@/services/actionService';
import { toast } from 'sonner';

interface StepAssignedActionsProps {
  stepId: number;
  isCurrentStep?: boolean;
}

export const StepAssignedActions = ({ 
  stepId,
  isCurrentStep = false 
}: StepAssignedActionsProps) => {
  const {
    data: assignedActions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['step-actions', stepId],
    queryFn: () => actionService.getStepActions(stepId),
    enabled: !!stepId
  });

  const handleActionClick = (actionId: number, actionTitle: string) => {
    // TODO: In the future, this will actually apply the action to the document
    toast.success(`Action "${actionTitle}" completed successfully`, {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <ListTodo className="h-3 w-3" />
          <span>Assigned Actions</span>
        </div>
        <div className="space-y-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>
    );
  }

  if (error || !assignedActions) {
    return null;
  }

  if (assignedActions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <ListTodo className="h-3 w-3" />
        <span>Assigned Actions</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {assignedActions.map((action) => (
          isCurrentStep ? (
            <Button
              key={action.actionId}
              variant="outline"
              size="sm"
              className="h-7 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
              onClick={() => handleActionClick(action.actionId, action.title)}
            >
              <ListTodo className="h-3 w-3 mr-1" />
              {action.title}
            </Button>
          ) : (
            <div
              key={action.actionId}
              className="px-2 py-1 rounded-md text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400"
            >
              {action.title}
            </div>
          )
        ))}
      </div>
    </div>
  );
}; 