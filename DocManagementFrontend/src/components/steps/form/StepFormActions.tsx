import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStepForm } from "./StepFormProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StepFormActionsProps {
  onCancel: () => void;
}

export const StepFormActions = ({ onCancel }: StepFormActionsProps) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    submitForm,
    isSubmitting,
    isEditMode,
    totalSteps,
    formErrors,
    formData,
  } = useStepForm();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Check if there are errors for the current step
  const currentStepErrors = formErrors[currentStep] || [];
  const hasErrors = currentStepErrors.length > 0;

  // Check if all required data is present for submission
  const canSubmit = formData.title.trim() && 
                   formData.circuitId && 
                   formData.currentStatusId && 
                   formData.nextStatusId &&
                   (!formData.requiresApproval || 
                    (formData.approvalType === "user" && formData.approvalUserId) ||
                    (formData.approvalType === "group" && formData.approvalGroupId));

  const handleNext = async () => {
    if (isLastStep) {
      await submitForm();
    } else {
      await nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <div className="space-y-3">
      {/* Display form errors */}
      {hasErrors && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900/50 text-red-400 py-2 px-3"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {currentStepErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={isFirstStep ? onCancel : handlePrev}
          className="flex-1 sm:flex-none px-2 py-1 text-xs bg-transparent border-blue-800/50 hover:bg-blue-900/30 text-gray-300 shadow-sm h-8"
          size="sm"
        >
          {isFirstStep ? (
            "Cancel"
          ) : (
            <>
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || (isLastStep && !canSubmit)}
          className={`flex-1 sm:flex-none px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md h-8 
            ${(isSubmitting || (isLastStep && !canSubmit)) ? "opacity-50 cursor-not-allowed" : ""}`}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              {isLastStep ? "Saving..." : "Processing..."}
            </>
          ) : isLastStep ? (
            <>
              <Save className="mr-1 h-3 w-3" />
              {isEditMode ? "Update Step" : "Create Step"}
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};
