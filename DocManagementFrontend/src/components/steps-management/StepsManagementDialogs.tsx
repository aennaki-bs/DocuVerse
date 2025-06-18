
import { DeleteStepDialog } from '@/components/steps/dialogs/DeleteStepDialog';
import { StepFormDialog } from '@/components/steps/dialogs/StepFormDialog';

interface StepsManagementDialogsProps {
  isFormDialogOpen: boolean;
  setIsFormDialogOpen: (open: boolean) => void;
  onFormSuccess: () => void;
  currentStep: Step | null;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  onDeleteConfirm: () => void;
  stepToDelete: Step | null;
  bulkDeleteDialogOpen: boolean;
  setBulkDeleteDialogOpen: (open: boolean) => void;
  onBulkDeleteConfirm: () => void;
  selectedStepsCount: number;
  onRefetch: () => void;
  circuitId?: number;
}

export const StepsManagementDialogs = ({
  isFormDialogOpen,
  setIsFormDialogOpen,
  onFormSuccess,
  currentStep,
  deleteDialogOpen,
  setDeleteDialogOpen,
  onDeleteConfirm,
  stepToDelete,
  bulkDeleteDialogOpen,
  setBulkDeleteDialogOpen,
  onBulkDeleteConfirm,
  selectedStepsCount,
  onRefetch,
  circuitId
}: StepsManagementDialogsProps) => {
  return (
    <>
      <StepFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSuccess={onFormSuccess}
        editStep={currentStep || undefined}
        circuitId={circuitId}
      />

      <DeleteStepDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        stepId={stepToDelete?.id || 0}
        stepTitle={stepToDelete?.title || ''}
        onSuccess={onRefetch}
        onConfirm={onDeleteConfirm}
      />

      <DeleteStepDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        stepId={0} // Not used for bulk delete
        stepTitle={`${selectedStepsCount} steps`}
        onSuccess={onRefetch}
        onConfirm={onBulkDeleteConfirm}
        isBulk={true}
        count={selectedStepsCount}
      />
    </>
  );
};
