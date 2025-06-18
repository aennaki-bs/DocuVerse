
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

interface StepSelectorProps {
  control: Control<any>;
  circuitDetails: any[] | undefined;
  currentStepId?: number;
}

export function StepSelector({ control, circuitDetails, currentStepId }: StepSelectorProps) {
  return (
    <FormField
      control={control}
      name="circuitDetailId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white">Select Step</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="bg-[#111633] border-blue-900/30 text-white">
                <SelectValue placeholder="Select a step" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-[#111633] border-blue-900/30 text-white">
              {circuitDetails?.map((detail) => (
                <SelectItem 
                  key={detail.id} 
                  value={detail.id.toString()}
                  disabled={detail.id === currentStepId}
                >
                  {detail.orderIndex + 1}. {detail.title}
                  {detail.id === currentStepId ? ' (Current)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
