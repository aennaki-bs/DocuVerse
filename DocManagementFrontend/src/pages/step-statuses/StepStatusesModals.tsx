
import { StatusFormDialog } from '@/components/statuses/dialogs/StatusFormDialog';
import { DeleteStatusDialog } from '@/components/statuses/dialogs/DeleteStatusDialog';
import { DocumentStatus } from '@/models/documentCircuit';

interface StepStatusesModalsProps {
  isSimpleUser: boolean;
  formDialogOpen: boolean;
  setFormDialogOpen: (val: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (val: boolean) => void;
  selectedStatus: DocumentStatus | null;
  onSuccess: () => void;
  stepId: number;
}

export function StepStatusesModals({
  isSimpleUser,
  formDialogOpen,
  setFormDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  selectedStatus,
  onSuccess,
  stepId,
}: StepStatusesModalsProps) {
  if (isSimpleUser) return null;
  return (
    <>
      <StatusFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={onSuccess}
        status={selectedStatus}
        stepId={stepId}
      />
      <DeleteStatusDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        status={selectedStatus}
        onSuccess={onSuccess}
      />
    </>
  );
}
