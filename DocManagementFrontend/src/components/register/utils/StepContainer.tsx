import React, { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "./NavigationButtons";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface StepContainerProps {
  children: ReactNode;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextLoading?: boolean;
  isNextDisabled?: boolean;
}

const StepContainer: React.FC<StepContainerProps> = ({
  children,
  onNext,
  onBack,
  nextLabel = "Next",
  backLabel = "Back",
  isNextLoading = false,
  isNextDisabled = false,
}) => {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="flex-1 bg-[#0d1528]/80 backdrop-blur-sm rounded-md border border-blue-900/30 shadow-lg overflow-hidden mb-4">
        <ScrollArea className="h-[calc(100%-1rem)] max-h-[380px]">
          <div className="p-6 space-y-6">{children}</div>
        </ScrollArea>
      </div>

      {/* Fixed navigation at bottom */}
      <div className="mt-auto">
        <NavigationButtons
          onNext={onNext}
          onBack={onBack}
          nextLabel={nextLabel}
          backLabel={backLabel}
          isNextLoading={isNextLoading}
          isNextDisabled={isNextDisabled}
        />

        <div className="flex items-center justify-center mt-6">
          <span className="text-sm text-gray-400 mr-2">
            Already have an account?
          </span>
          <Link
            to="/login"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span className="font-medium">Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StepContainer;
