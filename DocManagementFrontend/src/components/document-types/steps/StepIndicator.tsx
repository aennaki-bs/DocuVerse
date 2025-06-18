import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export const StepIndicator = ({
  currentStep,
  totalSteps = 3,
}: StepIndicatorProps) => {
  const steps = [
    { number: 1, label: "Name" },
    { number: 2, label: "Details" },
    { number: 3, label: "Review" },
  ];

  return (
    <div className="flex items-center justify-between relative mb-8 mt-2">
      {/* Background line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-blue-900/40 -translate-y-1/2" />

      {/* Active line */}
      <motion.div
        className="absolute top-1/2 left-0 h-[2px] bg-blue-500 -translate-y-1/2"
        initial={{ width: "0%" }}
        animate={{
          width: `${Math.max(
            0,
            ((currentStep - 1) / (totalSteps - 1)) * 100
          )}%`,
        }}
        transition={{ duration: 0.5 }}
      />

      {steps.slice(0, totalSteps).map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isPending = currentStep < step.number;

        return (
          <div
            key={step.number}
            className="flex flex-col items-center relative z-10"
          >
            <motion.div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                isActive
                  ? "bg-blue-500 text-white"
                  : isCompleted
                  ? "bg-blue-500 text-white"
                  : "bg-blue-900/20 text-blue-300"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {step.number}
            </motion.div>

            <motion.span
              className={`mt-2 text-sm ${
                isActive || isCompleted ? "text-blue-300" : "text-blue-900/50"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              {step.label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};
