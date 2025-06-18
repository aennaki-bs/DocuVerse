import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface FormActionsProps {
  step: number;
  totalSteps?: number;
  isEditMode: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isNextDisabled: boolean;
  isValidating: boolean;
}

export const FormActions = ({
  step,
  totalSteps = 2,
  isEditMode,
  onNext,
  onPrev,
  onSubmit,
  onCancel,
  isNextDisabled,
  isValidating,
}: FormActionsProps) => {
  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;
  const isReviewStep = totalSteps > 2 && step === totalSteps - 1;

  return (
    <motion.div
      className="flex justify-between gap-3 mt-6 pt-4 border-t border-blue-900/20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Button
        type="button"
        variant="outline"
        onClick={isFirstStep ? onCancel : onPrev}
        className="h-10 px-5 text-sm bg-transparent border-blue-800/50 hover:bg-blue-900/30 text-gray-300 shadow-sm"
      >
        {isFirstStep ? (
          "Cancel"
        ) : (
          <>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </>
        )}
      </Button>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="button"
          onClick={isLastStep || isEditMode ? onSubmit : onNext}
          disabled={isNextDisabled || isValidating}
          className={`h-10 px-5 text-sm shadow-sm ${
            isValidating
              ? "bg-blue-800 text-blue-100"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : isLastStep ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? "Update Type" : "Create Type"}
            </>
          ) : isReviewStep ? (
            <>
              Review
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
