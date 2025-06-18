import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Action } from '@/models/action';

interface DeleteActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: Action | null;
  onConfirm: () => Promise<void>;
}

export function DeleteActionDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
}: DeleteActionDialogProps) {
  if (!action) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Action</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the action "{action.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
