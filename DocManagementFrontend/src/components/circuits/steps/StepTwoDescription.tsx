
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface StepTwoDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function StepTwoDescription({ value, onChange, disabled }: StepTwoDescriptionProps) {
  return (
    <FormField
      name="descriptif"
      render={() => (
        <FormItem>
          <FormLabel className="text-blue-200 font-medium">Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter circuit description (optional)"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-[#0a1033] border-blue-800/80 text-blue-100 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500/80 min-h-[100px]"
              disabled={disabled}
            />
          </FormControl>
          <FormMessage className="text-red-400 text-xs" />
        </FormItem>
      )}
    />
  );
}
