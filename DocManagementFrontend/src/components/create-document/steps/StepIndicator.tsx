import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({
  currentStep,
  totalSteps = 4,
}: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Type" },
    { number: 2, title: "Title" },
    { number: 3, title: "Date" },
    { number: 4, title: "Content" },
  ].slice(0, totalSteps);

  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <div key={step.number} className="flex flex-col items-center relative">
          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div className="absolute top-3 left-[calc(50%+12px)] w-[calc(100%-24px)] h-[2px]">
              <div
                className="h-full bg-gray-700 rounded-full"
                style={{ width: "100%" }}
              ></div>
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 absolute top-0 left-0"
                style={{ width: currentStep > step.number ? "100%" : "0%" }}
              ></div>
            </div>
          )}

          {/* Step circle */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
              ${
                step.number === currentStep
                  ? "bg-blue-600 text-white ring-2 ring-blue-600/20"
                  : step.number < currentStep
                  ? "bg-blue-600/20 text-blue-500 border border-blue-500"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }`}
          >
            {step.number < currentStep ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className="text-xs">{step.number}</span>
            )}
          </div>

          {/* Step title */}
          <span
            className={`mt-1 text-xs transition-all
              ${
                step.number === currentStep
                  ? "text-blue-400"
                  : step.number < currentStep
                  ? "text-gray-300"
                  : "text-gray-500"
              }
            `}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
};
