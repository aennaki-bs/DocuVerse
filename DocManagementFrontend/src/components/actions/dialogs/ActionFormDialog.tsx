import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Action, CreateActionDto, UpdateActionDto } from '@/models/action';

const createActionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
});

const updateActionSchema = createActionSchema;

interface ActionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: Action | null;
  onSubmit: (data: CreateActionDto | UpdateActionDto) => Promise<void>;
}

export function ActionFormDialog({ open, onOpenChange, action, onSubmit }: ActionFormDialogProps) {
  const isEditing = !!action;
  const schema = isEditing ? updateActionSchema : createActionSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: action?.title || '',
      description: action?.description || '',
    },
  });

  const handleSubmit = async (data: CreateActionDto | UpdateActionDto) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{action ? 'Edit Action' : 'Create Action'}</DialogTitle>
          <DialogDescription>
            {action 
              ? 'Update the details of the existing action.' 
              : 'Create a new action by filling out the form below.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {action ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
