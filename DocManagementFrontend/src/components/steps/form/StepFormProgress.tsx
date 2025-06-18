import { CheckCircle } from "lucide-react";
import { useStepForm } from "./StepFormProvider";

interface StepFormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepFormProgress = ({
  currentStep,
  totalSteps,
}: StepFormProgressProps) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Status Selection";
      case 3:
        return "Step Options";
      case 4:
        return "Review";
      default:
        return "Step";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return "Enter the basic information for your step";
      case 2:
        return "Define current and next status for this step";
      case 3:
        return "Configure approval settings";
      case 4:
        return "Review your step before creating it";
      default:
        return "";
    }
  };

  return (
    <div className="mb-3">
      {/* Step indicators */}
      <div className="flex justify-center items-center mb-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center h-6 w-6 rounded-full transition-all duration-300
                ${
                  step === currentStep
                    ? "bg-blue-600 text-white ring-1 ring-blue-600/20 shadow-sm"
                    : step < currentStep
                    ? "bg-blue-600 text-white border border-blue-500"
                    : "bg-gray-800/70 text-gray-400 border border-gray-700"
                }`}
            >
              {step < currentStep ? (
                <CheckCircle className="h-3 w-3 text-white" />
              ) : (
                <span className="text-xs font-medium">{step}</span>
              )}
            </div>

            {step !== steps.length && (
              <div
                className={`h-[2px] w-4 sm:w-6 md:w-8 transition-all duration-300
                  ${step < currentStep ? "bg-blue-600" : "bg-gray-700"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <p className="text-center text-sm font-medium text-blue-300 mb-0.5">
        {getStepTitle(currentStep)}
      </p>
      <p className="text-center text-xs text-gray-400">
        {getStepDescription(currentStep)}
      </p>
    </div>
  );
};
