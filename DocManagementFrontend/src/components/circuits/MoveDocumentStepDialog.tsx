
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';
import { useDocumentMovement } from '@/hooks/useDocumentMovement';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

// Import our new components
import { StepSelector } from './move-document/StepSelector';
import { DialogFooterButtons } from './move-document/DialogFooterButtons';
import { ErrorMessage } from './move-document/ErrorMessage';
import { LoadingState } from './move-document/LoadingState';

const formSchema = z.object({
  circuitDetailId: z.string().min(1, { message: 'Please select a step' }),
});

type FormValues = z.infer<typeof formSchema>;

interface MoveDocumentStepDialogProps {
  documentId: number;
  documentTitle: string;
  circuitId: number;
  currentStepId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MoveDocumentStepDialog({
  documentId,
  documentTitle,
  circuitId,
  currentStepId,
  open,
  onOpenChange,
  onSuccess,
}: MoveDocumentStepDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const { isMoving, moveDocument } = useDocumentMovement({
    onMoveSuccess: onSuccess
  });

  // Fetch circuit details
  const { data: circuitDetails, isLoading } = useQuery({
    queryKey: ['circuit-details', circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(circuitId),
    enabled: open && !!circuitId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      circuitDetailId: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    
    try {
      const targetStepId = parseInt(values.circuitDetailId);
      const currentStep = circuitDetails?.find(step => step.id === currentStepId);
      const targetStep = circuitDetails?.find(step => step.id === targetStepId);
      
      const success = await moveDocument({
        documentId,
        currentStepId,
        targetStepId,
        currentStep,
        targetStep,
        comments: `Moved document from dialog to step #${targetStepId}`
      });
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error moving document:", error);
      const errorMessage = error?.response?.data || 'Failed to move document to new step';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move Document to Another Step</DialogTitle>
          <DialogDescription>
            Select a step to move "{documentTitle}" to
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ErrorMessage error={error} />
              
              <StepSelector 
                control={form.control}
                circuitDetails={circuitDetails}
                currentStepId={currentStepId}
              />

              <DialogFooterButtons 
                isMoving={isMoving}
                onCancel={() => onOpenChange(false)}
              />
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
