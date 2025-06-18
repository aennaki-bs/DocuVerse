
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  descriptif: z.string().optional(),
  orderIndex: z.coerce.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StepTwoCircuitSteps() {
  const { formData, addStep, removeStep, nextStep, prevStep } = useCircuitForm();
  const [isAddingStep, setIsAddingStep] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      descriptif: '',
      orderIndex: formData.steps.length,
    },
  });

  const onAddStep = (values: FormValues) => {
    addStep({
      title: values.title,
      descriptif: values.descriptif || '',
      orderIndex: values.orderIndex,
    });
    
    form.reset({
      title: '',
      descriptif: '',
      orderIndex: formData.steps.length + 1,
    });
    
    setIsAddingStep(false);
    toast.success('Step added successfully');
  };

  const handleNext = () => {
    if (formData.steps.length === 0) {
      toast.error('You must add at least one step to continue');
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Circuit Steps</h3>
      
      {formData.steps.length > 0 ? (
        <div className="space-y-3">
          {formData.steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-2 right-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <div className="font-medium">{step.title}</div>
                  {step.descriptif && (
                    <div className="text-sm text-gray-500">{step.descriptif}</div>
                  )}
                  <div className="text-xs text-gray-400">Order: {step.orderIndex}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md text-gray-500">
          No steps added yet. Add steps to continue.
        </div>
      )}

      {isAddingStep ? (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddStep)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter step title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter step description"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsAddingStep(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Step
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsAddingStep(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Step
        </Button>
      )}

      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button 
          type="button"
          onClick={handleNext}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
