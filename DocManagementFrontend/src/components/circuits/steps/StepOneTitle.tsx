
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface StepOneTitleProps {
  value: string;
  onChange: (value: string) => void;
  error: string | undefined;
  disabled?: boolean;
}

export default function StepOneTitle({ value, onChange, error, disabled }: StepOneTitleProps) {
  return (
    <FormField
      name="title"
      render={() => (
        <FormItem>
          <FormLabel className="text-blue-200 font-medium">Title *</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter circuit title"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
              disabled={disabled}
              className="bg-[#0a1033] border-blue-800/80 text-blue-100 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500/80 h-11"
            />
          </FormControl>
          <FormMessage className="text-red-400 text-xs">{error}</FormMessage>
        </FormItem>
      )}
    />
  );
}
