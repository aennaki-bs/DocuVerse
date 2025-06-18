
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStepForm } from './StepFormProvider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  responsibleRoleId: z.number().nullable().optional(),
  isFinalStep: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export const StepSettings = () => {
  const { formData, setFormData } = useStepForm();

  // Mock API call for roles, replace with actual service
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => [
      { id: 1, roleName: 'Admin' },
      { id: 2, roleName: 'Manager' },
      { id: 3, roleName: 'User' },
    ],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      responsibleRoleId: formData.responsibleRoleId || null,
      isFinalStep: formData.isFinalStep || false,
    },
  });

  const onSubmit = (values: FormValues) => {
    setFormData(values);
    // Do not navigate, this will be handled by the parent's Next button
  };

  // Update the parent form data when form values change
  const handleRoleChange = (value: string) => {
    const roleId = value === "null" ? null : parseInt(value, 10);
    form.setValue('responsibleRoleId', roleId);
    setFormData({ responsibleRoleId: roleId });
  };

  const handleFinalStepChange = (checked: boolean) => {
    form.setValue('isFinalStep', checked);
    setFormData({ isFinalStep: checked });
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
          name="responsibleRoleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsible Role</FormLabel>
              <Select
                value={field.value?.toString() || "null"}
                onValueChange={handleRoleChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="No specific role required" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Key fix: Use "null" instead of empty string for clearing the selection */}
                  <SelectItem value="null">No specific role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                If specified, only users with this role can perform actions on this step
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFinalStep"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Final Step</FormLabel>
                <FormDescription>
                  Mark this as the final step in the workflow
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={handleFinalStepChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
