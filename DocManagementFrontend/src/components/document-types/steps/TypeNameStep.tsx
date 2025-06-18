import { Control } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface TypeNameStepProps {
  control: Control<any>;
  isTypeNameValid: boolean | null;
  isValidating: boolean;
  onTypeNameChange: () => void;
}

export const TypeNameStep = ({
  control,
  isTypeNameValid,
  isValidating,
  onTypeNameChange,
}: TypeNameStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Enter document type name"
                  className="h-12 text-sm bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10 rounded-md"
                  onChange={(e) => {
                    field.onChange(e);
                    onTypeNameChange();
                  }}
                />
                {isValidating && (
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  </motion.div>
                )}
                {isTypeNameValid === true && (
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </motion.div>
                )}
              </div>
            </FormControl>
            <FormDescription className="text-sm text-blue-300/70 mt-2">
              This name must be unique and at least 2 characters long
            </FormDescription>
            {isTypeNameValid === false && (
              <motion.p
                className="text-sm text-red-400 flex items-center mt-2"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="inline-block w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-center mr-2 flex items-center justify-center text-xs">
                  !
                </span>
                This type name already exists
              </motion.p>
            )}
            {isTypeNameValid === true && (
              <motion.p
                className="text-sm text-green-500 flex items-center mt-2"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="inline-block w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-center mr-2 flex items-center justify-center text-xs">
                  ✓
                </span>
                Type name is available
              </motion.p>
            )}
            <FormMessage className="text-sm mt-1 text-red-400" />
          </FormItem>
        )}
      />
    </motion.div>
  );
};
