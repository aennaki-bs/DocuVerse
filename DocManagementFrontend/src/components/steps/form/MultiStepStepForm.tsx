import { useStepForm } from "./StepFormProvider";
import { StepFormProgress } from "./StepFormProgress";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepReview } from "./StepReview";
import { StepFormActions } from "./StepFormActions";
import { StepOptions } from "./StepOptions";
import { StepStatusSelection } from "./StepStatusSelection";
import { AnimatePresence, motion } from "framer-motion";

interface MultiStepStepFormProps {
  onCancel: () => void;
}

export const MultiStepStepForm = ({ onCancel }: MultiStepStepFormProps) => {
  const { currentStep, totalSteps } = useStepForm();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepStatusSelection />;
      case 3:
        return <StepOptions />;
      case 4:
        return <StepReview />;
      default:
        return <StepBasicInfo />;
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-3">
      <StepFormProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <StepFormActions onCancel={onCancel} />
    </div>
  );
};
