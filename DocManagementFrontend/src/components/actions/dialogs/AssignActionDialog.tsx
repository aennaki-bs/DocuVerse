import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Action, AssignActionToStepDto, StatusEffectDto } from '@/models/action';
import stepService from '@/services/stepService';
import { actionService } from '@/services/actionService';
import { toast } from '@/components/ui/use-toast';

const assignActionSchema = z.object({
  stepId: z.string().min(1, 'Please select a step'),
  statusEffects: z.array(z.object({
    statusId: z.number(),
    setsComplete: z.boolean()
  })).optional()
});

interface AssignActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: Action | null;
}

export function AssignActionDialog({ open, onOpenChange, action }: AssignActionDialogProps) {
  const [loading, setLoading] = useState(false);

  const { data: steps = [] } = useQuery({
    queryKey: ['steps'],
    queryFn: stepService.getAllSteps,
  });

  const form = useForm({
    resolver: zodResolver(assignActionSchema),
    defaultValues: {
      stepId: '',
      statusEffects: []
    }
  });

  const handleSubmit = async (values: z.infer<typeof assignActionSchema>) => {
    if (!action) return;

    setLoading(true);
    try {
      const data: AssignActionToStepDto = {
        stepId: parseInt(values.stepId),
        actionId: action.actionId,
        statusEffects: values.statusEffects
      };

      await actionService.assignToStep(data);
      toast({
        title: "Success",
        description: "Action assigned to step successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign action to step",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Action to Step</DialogTitle>
          <DialogDescription>
            Select a step to assign the action "{action.title}" to.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stepId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a step" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {steps.map((step) => (
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 