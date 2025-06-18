import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { MultiStepStepForm } from "../steps/form/MultiStepStepForm";
import { StepFormProvider } from "../steps/form/StepFormProvider";
import { Step } from "@/models/step";
import { DocumentStatus } from "@/models/documentCircuit";

interface StepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  step?: Step | null;
  circuitId: number;
  statusOptions: DocumentStatus[];
}

export function StepFormDialog({
  open,
  onOpenChange,
  onSuccess,
  step,
  circuitId,
}: StepFormDialogProps) {
  const [error, setError] = useState<string | null>(null);

  // Reset error when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  const dialogTitle = step ? "Edit Step" : "Create New Step";
  const dialogDescription = step
    ? "Update the step details with our step-by-step wizard"
    : "Create a new step for this circuit using our step-by-step wizard";

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2 mb-2 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">
            <p>{error}</p>
          </div>
        )}

        <StepFormProvider
          editStep={step || undefined}
          onSuccess={onSuccess}
          circuitId={circuitId}
        >
          <MultiStepStepForm onCancel={() => handleDialogChange(false)} />
        </StepFormProvider>
      </DialogContent>
    </Dialog>
  );
}
