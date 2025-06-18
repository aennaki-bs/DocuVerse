import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface TypeDetailsStepProps {
  control: Control<any>;
}

export const TypeDetailsStep = ({ control }: TypeDetailsStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <FormField
        control={control}
        name="typeName"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel className="text-sm font-medium text-blue-100 flex items-center">
              Type Name
              <span className="text-red-400 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter document type name"
                className="h-12 text-sm bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
              />
            </FormControl>
            <FormMessage className="text-sm mt-1 text-red-400" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="typeAttr"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-blue-100">
              Type Description (Optional)
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter description (optional)"
                className="min-h-[120px] text-sm bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none rounded-md"
              />
            </FormControl>
            <FormDescription className="text-sm text-blue-300/70 mt-2">
              Additional description for this document type
            </FormDescription>
            <FormMessage className="text-sm mt-1 text-red-400" />
          </FormItem>
        )}
      />
    </motion.div>
  );
};
