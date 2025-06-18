
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';
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
import { Check, ArrowRightToLine, X } from 'lucide-react';
import { ActionDto } from '@/models/documentCircuit';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  actionId: z.string().min(1, { message: 'Action is required' }),
  comments: z.string().min(3, { message: 'Comments must be at least 3 characters' }),
  isApproved: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export interface ProcessCircuitStepDialogProps {
  documentId: number;
  documentTitle: string;
  currentStep: string;
  availableActions: ActionDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ProcessCircuitStepDialog({
  documentId,
  documentTitle,
  currentStep,
  availableActions,
  open,
  onOpenChange,
  onSuccess,
}: ProcessCircuitStepDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actionId: '',
      comments: '',
      isApproved: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await circuitService.performAction({
        documentId,
        actionId: parseInt(values.actionId),
        comments: values.comments,
        isApproved: values.isApproved,
      });
      
      toast.success('Document step processed successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error processing document step:', error);
      toast.error('Failed to process document step');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Document Step</DialogTitle>
          <DialogDescription>
            <p>Document: {documentTitle}</p>
            <p>Current Step: {currentStep}</p>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="actionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Action</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action to perform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableActions.map((action) => (
                        <SelectItem key={action.actionId} value={action.actionId.toString()}>
                          {action.title}
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
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your comments about this step"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <div className="space-x-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => form.setValue('isApproved', true)}
                >
                  {isSubmitting ? 'Processing...' : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> 
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
