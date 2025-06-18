
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCircuitForm } from '@/context/CircuitFormContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const formSchema = z.object({
  isActive: z.boolean().default(true),
  hasOrderedFlow: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function StepThreeSettings() {
  const { formData, setCircuitData, nextStep, prevStep } = useCircuitForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isActive: formData.isActive,
      hasOrderedFlow: formData.hasOrderedFlow,
    },
  });

  const onSubmit = (values: FormValues) => {
    setCircuitData({
      isActive: values.isActive,
      hasOrderedFlow: values.hasOrderedFlow,
    });
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert variant="default" className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Configure the behavior settings for your circuit workflow.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Circuit</FormLabel>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    When active, this circuit can be assigned to documents.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasOrderedFlow"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sequential Flow</FormLabel>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    When enabled, steps must be completed in order. Otherwise, steps can be completed in any order.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={prevStep}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button type="submit">
            Next Step <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
