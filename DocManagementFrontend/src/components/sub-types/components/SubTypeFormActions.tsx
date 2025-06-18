import { Button } from "@/components/ui/button";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { ArrowLeft, ArrowRight, Check, Loader2, X, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface SubTypeFormActionsProps {
  onCancel: () => void;
}

export const SubTypeFormActions = ({ onCancel }: SubTypeFormActionsProps) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    handleSubmit,
    validateCurrentStep,
    isLoading,
  } = useSubTypeForm();

  return (
    <div className="flex items-center justify-between pt-4 pb-4 px-4 border-t border-blue-900/50 bg-[#0f1642] shadow-lg">
      <div>
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isLoading}
            className="h-10 bg-[#141b4d] border-blue-800/50 hover:bg-[#1a2266] text-white font-medium px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 bg-[#141b4d] border-blue-800/50 hover:bg-[#1a2266] text-white font-medium px-4"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
      <div>
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={handleSubmit}
            className="min-w-[120px] h-9 bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Series
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
