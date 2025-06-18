
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStepForm } from './StepFormProvider';
import circuitService from '@/services/circuitService';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  circuitId: z.number().min(1, 'Please select a circuit'),
  orderIndex: z.number().min(0, 'Order index must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export const StepCircuitInfo = () => {
  const { formData, setFormData, isEditMode } = useStepForm();

  const { data: circuits = [], isLoading } = useQuery({
    queryKey: ['circuits'],
    queryFn: circuitService.getAllCircuits,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      circuitId: formData.circuitId || 0,
      orderIndex: formData.orderIndex || 10,
    },
  });

  const onSubmit = (values: FormValues) => {
    setFormData(values);
    // Do not navigate, this will be handled by the parent's Next button
  };

  // Update the parent form data when form values change
  const handleCircuitChange = (value: string) => {
    const circuitId = parseInt(value, 10);
    form.setValue('circuitId', circuitId);
    setFormData({ circuitId });
  };

  const handleOrderIndexChange = (value: string) => {
    const orderIndex = parseInt(value, 10) || 0;
    form.setValue('orderIndex', orderIndex);
    setFormData({ orderIndex });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="circuitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuit</FormLabel>
              <Select
                disabled={isEditMode}
                value={field.value.toString()}
                onValueChange={handleCircuitChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a circuit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {circuits.map((circuit) => (
                    <SelectItem key={circuit.id} value={circuit.id.toString()}>
                      {circuit.title}
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
          name="orderIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Index</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="Enter order index"
                  value={field.value}
                  onChange={(e) => handleOrderIndexChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
