import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';

interface DeleteStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepId: number;
  currentStatus: string;
  nextStatus: string;
  onSuccess: () => void;
}

export function DeleteStepDialog({
  open,
  onOpenChange,
  stepId,
  currentStatus,
  nextStatus,
  onSuccess,
}: DeleteStepDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`/Circuit/steps/${stepId}`);
      toast.success('Step deleted successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting step:', error);
      setError(
        error.response?.data || 
        'An error occurred while deleting the step. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-600">Delete Step</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this step?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2 mb-2 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">
            <p>{error}</p>
          </div>
        )}

        <div className="py-4">
          <p className="mb-4">
            This will remove the step from:
          </p>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="font-medium">{currentStatus}</div>
            <div className="flex justify-center my-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className="text-red-500">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
            <div className="font-medium">{nextStatus}</div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Step'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 