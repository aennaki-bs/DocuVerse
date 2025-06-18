
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Save } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  descriptif: z.string().optional(),
  orderIndex: z.coerce.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCircuitDetailDialogProps {
  circuitId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCircuitDetailDialog({
  circuitId,
  open,
  onOpenChange,
  onSuccess,
}: CreateCircuitDetailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing circuit details to determine next order index
  const { data: circuitDetails } = useQuery({
    queryKey: ['circuit-details', circuitId],
    queryFn: () => circuitService.getCircuitDetailsByCircuitId(circuitId),
    enabled: open,
  });

  // Calculate the next order index
  const nextOrderIndex = circuitDetails && circuitDetails.length > 0 
    ? Math.max(...circuitDetails.map(d => d.orderIndex)) + 1 
    : 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      descriptif: '',
      orderIndex: nextOrderIndex || 0,
    },
    values: {
      title: '',
      descriptif: '',
      orderIndex: nextOrderIndex || 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await circuitService.createCircuitDetail({
        circuitId: circuitId,
        title: values.title,
        descriptif: values.descriptif || '',
        orderIndex: values.orderIndex,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      form.reset();
      onOpenChange(false);
      onSuccess();
      toast.success('Circuit step created successfully');
    } catch (error) {
      toast.error('Failed to create circuit step');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-[#0f1642] border-blue-900/30 shadow-xl p-4 rounded-lg">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg flex items-center text-white">
            <Plus className="h-4 w-4 mr-2 text-blue-400" />
            Add Circuit Step
          </DialogTitle>
          <DialogDescription className="text-xs text-blue-300">
            Create a new step for this circuit
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-blue-200">Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter step title" 
                      {...field} 
                      className="h-9 text-sm bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-blue-200">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter step description"
                      {...field}
                      value={field.value || ''}
                      className="text-sm bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500 min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-blue-200">Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      className="h-9 text-sm bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-8 text-xs bg-transparent border-blue-800/50 hover:bg-blue-900/30 text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-8 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Create Step
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
