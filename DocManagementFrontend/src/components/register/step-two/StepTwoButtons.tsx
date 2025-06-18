import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface StepTwoButtonsProps {
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
}

const StepTwoButtons: React.FC<StepTwoButtonsProps> = ({
  onBack,
  onNext,
  isLoading,
}) => {
  return (
    <div className="flex gap-3 sm:gap-4 pt-2">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-blue-300 bg-[#0f1729] border border-blue-900/30 hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors disabled:opacity-70 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors disabled:opacity-70 text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1 sm:mr-2" />
            <span>Validating...</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default StepTwoButtons;
