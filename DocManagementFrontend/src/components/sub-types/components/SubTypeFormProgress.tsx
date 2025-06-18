import { useSubTypeForm } from "./SubTypeFormProvider";
import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";

export const SubTypeFormProgress = () => {
  const { currentStep } = useSubTypeForm();

  const steps = [
    {
      number: 1,
      title: "Dates",
      description: "Set date range and status",
    },
    { number: 2, title: "Enter Code", description: "Enter series code" },
    { number: 3, title: "Review", description: "Review and submit" },
  ];

  return (
    <div className="mb-3 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold text-white mb-1"
      >
        Create New Series
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="text-xs text-blue-300/90 mb-3"
      >
        Step {currentStep} of {steps.length}
      </motion.p>

      <div className="flex items-center justify-center gap-1 px-2 mb-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.button
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep === step.number
                    ? "bg-blue-500 text-white ring-1 ring-blue-400/30 shadow-sm"
                    : currentStep > step.number
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-900/30 text-blue-300/50"
                }`}
              >
                {currentStep > step.number ? (
                  <CheckIcon className="h-3.5 w-3.5 text-blue-300" />
                ) : (
                  step.number
                )}
              </motion.button>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  currentStep === step.number
                    ? "text-blue-300"
                    : currentStep > step.number
                    ? "text-blue-300/80"
                    : "text-blue-300/50"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="mx-2">
                <div
                  className={`h-[1px] w-10 transition-colors ${
                    currentStep > step.number + 1
                      ? "bg-blue-500"
                      : currentStep === step.number + 1 && currentStep > 1
                      ? "bg-gradient-to-r from-blue-500 to-blue-900/30"
                      : "bg-blue-900/40"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-blue-400/80 bg-blue-900/20 py-1.5 px-3 rounded-md border border-blue-900/30 inline-block max-w-sm mx-auto"
      >
        {steps[currentStep - 1]?.description}
      </motion.div>
    </div>
  );
};
