import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import circuitService from '@/services/circuitService';
import { useDocumentMovement } from '@/hooks/useDocumentMovement';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Loader2 } from 'lucide-react';

const formSchema = z.object({
  nextStepId: z.string().min(1, { message: 'Next step is required' }),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MoveToNextStepDialogProps {
  documentId: number;
  documentTitle: string;
  circuitId: number;
  currentStepId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MoveToNextStepDialog({
  documentId,
  documentTitle,
  circuitId,
  currentStepId,
  open,
  onOpenChange,
  onSuccess,
}: MoveToNextStepDialogProps) {
  const { isMoving, moveDocument } = useDocumentMovement({
    onMoveSuccess: onSuccess
  });

  // Fetch all steps for the current circuit
  const { data: circuitDetails, isLoading: isLoadingCircuitDetails } = useQuery({
    queryKey: ['circuit-details', circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(circuitId),
    enabled: open && !!circuitId,
  });

  // Filter available next steps (excluding current step)
  const availableNextSteps = circuitDetails?.filter(step => step.id !== currentStepId) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nextStepId: '',
      comments: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentStepId) {
      toast.error('Current step information is missing');
      return;
    }
    
    try {
      const targetStepId = parseInt(values.nextStepId);
      const currentStep = circuitDetails?.find(step => step.id === currentStepId);
      const targetStep = circuitDetails?.find(step => step.id === targetStepId);
      
      const success = await moveDocument({
        documentId,
        currentStepId,
        targetStepId,
        currentStep,
        targetStep,
        comments: values.comments
      });
      
      if (success) {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error moving document:', error);
      toast.error('Failed to move document to the selected step');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move Document to Next Step</DialogTitle>
          <DialogDescription>
            Document: {documentTitle}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nextStepId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Next Step</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoadingCircuitDetails || isMoving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a step to move to" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableNextSteps.map((step) => (
                        <SelectItem key={step.id} value={step.id.toString()}>
                          {step.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add optional comments about this move"
                      {...field}
                      rows={4}
                      disabled={isMoving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isMoving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isMoving || isLoadingCircuitDetails}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMoving ? (
                  <>Moving... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" /> 
                    Move to Next Step
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
