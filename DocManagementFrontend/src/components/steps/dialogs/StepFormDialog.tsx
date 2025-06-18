
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StepFormProvider } from '../form/StepFormProvider';
import { MultiStepStepForm } from '../form/MultiStepStepForm';
import { useParams } from 'react-router-dom';

interface StepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editStep?: Step;
  circuitId?: number;
}

export const StepFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
  editStep,
  circuitId,
}: StepFormDialogProps) => {
  const params = useParams<{ circuitId?: string }>();
  // Get circuit ID either from props or from URL params
  const contextCircuitId = circuitId || (params.circuitId ? parseInt(params.circuitId, 10) : undefined);
  
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[550px] bg-[#070b28] border-blue-900/30 backdrop-blur-md shadow-xl rounded-xl p-3 sm:p-4">
        <DialogHeader className="pb-1 space-y-0.5">
          <DialogTitle className="text-base text-white font-semibold">
            {editStep ? 'Edit Step' : 'Create New Step'}
          </DialogTitle>
          <DialogDescription className="text-xs text-blue-300">
            {editStep
              ? "Update this step's details"
              : contextCircuitId 
                ? 'Create a new step for this circuit'
                : 'Create a new step for your workflow circuit'}
          </DialogDescription>
        </DialogHeader>

        <StepFormProvider 
          editStep={editStep} 
          onSuccess={handleSuccess}
          circuitId={contextCircuitId}
        >
          <MultiStepStepForm onCancel={() => onOpenChange(false)} />
        </StepFormProvider>
      </DialogContent>
    </Dialog>
  );
};
