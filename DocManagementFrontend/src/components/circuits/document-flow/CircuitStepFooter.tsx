import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

interface CircuitStepFooterProps {
  isCurrentStep: boolean;
  isSimpleUser: boolean;
  canAdvanceToNext?: boolean;
  onPreviousStepClick?: () => void;
  onNextStepClick?: () => void;
}

export const CircuitStepFooter = ({
  isCurrentStep,
  isSimpleUser,
  canAdvanceToNext = false,
  onPreviousStepClick,
  onNextStepClick
}: CircuitStepFooterProps) => {
  if (!isCurrentStep || isSimpleUser) {
    return null;
  }
  
  return (
    <div className="px-2 py-2 border-t border-blue-900/30">
      <div className="flex items-center justify-between">
        {/* Previous Step Button - Always enabled */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousStepClick}
          className="h-8 text-xs px-3 bg-amber-900/10 border-amber-700/30 text-amber-400 hover:bg-amber-700/20"
          disabled={!onPreviousStepClick}
        >
          <ArrowLeftCircle className="h-3.5 w-3.5 mr-1.5" /> Previous
        </Button>
        
        {/* Next Step Button - Only enabled if steps status are completed */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextStepClick}
          className="h-8 text-xs px-3 bg-blue-600/10 border-blue-600/30 text-blue-400 hover:bg-blue-600/20"
          disabled={!canAdvanceToNext || !onNextStepClick}
        >
          Next <ArrowRightCircle className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
