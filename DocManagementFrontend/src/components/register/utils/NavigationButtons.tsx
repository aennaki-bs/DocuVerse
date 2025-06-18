import React from "react";
import { ChevronLeft, ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextLoading?: boolean;
  isNextDisabled?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  nextLabel = "Next",
  backLabel = "Back",
  isNextLoading = false,
  isNextDisabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <button
        onClick={onBack}
        className="flex items-center justify-center gap-2 h-12 px-5 rounded-md text-blue-300 bg-[#0d1528]/90 backdrop-blur-sm border border-blue-900/30 hover:bg-[#0d1528] focus:outline-none transition-colors text-sm font-medium"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>{backLabel}</span>
      </button>
      <button
        onClick={onNext}
        disabled={isNextLoading || isNextDisabled}
        className="flex items-center justify-center gap-2 h-12 px-5 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/20"
      >
        {isNextLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{nextLabel}</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </button>
    </div>
  );
};

export default NavigationButtons;
