import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, X, Loader2 } from "lucide-react";

interface StepNavigationProps {
  step: number;
  totalSteps: number;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const StepNavigation = ({
  step,
  totalSteps = 4,
  isSubmitting,
  onPrevStep,
  onNextStep,
  onSubmit,
  onCancel,
}: StepNavigationProps) => {
  const isLastStep = step === totalSteps;

  return (
    <div className="flex justify-between items-center">
      <div>
        {step === 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-gray-300"
            onClick={onCancel}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 hover:bg-gray-800 text-gray-300"
            onClick={onPrevStep}
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </Button>
        )}
      </div>

      {isLastStep ? (
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-1 h-3.5 w-3.5" />
              Create
            </>
          )}
        </Button>
      ) : (
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onNextStep}
        >
          Next
          <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
