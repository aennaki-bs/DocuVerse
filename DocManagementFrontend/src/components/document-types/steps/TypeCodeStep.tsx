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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

interface TypeCodeStepProps {
  control: Control<any>;
  isTypeCodeValid: boolean | null;
  isValidating: boolean;
  onTypeCodeChange: () => void;
  onGenerateCode: () => void;
  skipTypeCode: boolean;
  onSkipChange: (skip: boolean) => void;
}

export const TypeCodeStep = ({
  control,
  isTypeCodeValid,
  isValidating,
  onTypeCodeChange,
  onGenerateCode,
  skipTypeCode,
  onSkipChange,
}: TypeCodeStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3 p-4 bg-[#111633] rounded-md border border-blue-900/30">
        <Checkbox
          id="manual-code"
          checked={!skipTypeCode}
          onCheckedChange={(checked) => onSkipChange(!checked)}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <label
          htmlFor="manual-code"
          className="text-sm text-blue-200 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Generate code manually
        </label>
      </div>

      {!skipTypeCode ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormField
            control={control}
            name="typeKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-blue-100 flex items-center">
                  Type Code
                  <span className="text-red-400 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative flex">
                    <Input
                      {...field}
                      placeholder="Enter document type code"
                      className="h-12 text-sm bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10 rounded-md"
                      onChange={(e) => {
                        field.onChange(e);
                        onTypeCodeChange();
                      }}
                      maxLength={3}
                    />
                    <Button
                      type="button"
                      onClick={onGenerateCode}
                      className="ml-3 h-12 text-sm bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Generate
                    </Button>
                    {isValidating && (
                      <motion.div
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                      </motion.div>
                    )}
                    {isTypeCodeValid === true && (
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
                  The code must be unique and 2-3 characters long
                </FormDescription>
                {isTypeCodeValid === false && (
                  <motion.p
                    className="text-sm text-red-400 flex items-center mt-2"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="inline-block w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-center mr-2 flex items-center justify-center text-xs">
                      !
                    </span>
                    This type code already exists or is invalid
                  </motion.p>
                )}
                {isTypeCodeValid === true && (
                  <motion.p
                    className="text-sm text-green-500 flex items-center mt-2"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="inline-block w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-center mr-2 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    Type code is available
                  </motion.p>
                )}
                <FormMessage className="text-sm mt-1 text-red-400" />
              </FormItem>
            )}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-sm text-blue-300 p-6 bg-[#111633] rounded-md border border-blue-900/30"
        >
          <Check className="h-5 w-5 text-green-500 mx-auto mb-2" />
          <p>Type code will be automatically generated on the server</p>
        </motion.div>
      )}
    </motion.div>
  );
};
