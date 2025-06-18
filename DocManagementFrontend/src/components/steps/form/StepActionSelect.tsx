import { useQuery } from '@tanstack/react-query';
import { useStepForm } from './StepFormProvider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/services/api';

export const StepActionSelect = () => {
  const { formData, setFormData } = useStepForm();

  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: () => api.get('/Action').then(res => res.data),
  });

  return (
    <FormField
      control={formData.form?.control}
      name="actionId"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-gray-300 text-xs font-medium">Action</FormLabel>
          <Select
            value={field.value?.toString()}
            onValueChange={(value) => {
              field.onChange(value ? parseInt(value) : undefined);
              setFormData({ actionId: value ? parseInt(value) : undefined });
            }}
          >
            <FormControl>
              <SelectTrigger className="bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md h-8 text-xs">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-[#0d1541] border-blue-900/50 text-white">
              <SelectItem value="">None</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action.id} value={action.id.toString()}>
                  {action.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-red-400 text-xs" />
        </FormItem>
      )}
    />
  );
}; 