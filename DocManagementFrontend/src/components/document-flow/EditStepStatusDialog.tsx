import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DocumentStatus } from '@/models/documentCircuit';
import { useWorkflowStepStatuses } from '@/hooks/useWorkflowStepStatuses';

interface EditStepStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: DocumentStatus;
  documentId?: number;
  onSuccess: () => void;
}

export function EditStepStatusDialog({
  open,
  onOpenChange,
  status,
  documentId,
  onSuccess
}: EditStepStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(status.title);
  const [isRequired, setIsRequired] = useState(status.isRequired);
  const [isComplete, setIsComplete] = useState(status.isComplete);
  
  const { completeStatus } = useWorkflowStepStatuses(documentId || 0);

  const handleSubmit = async () => {
    if (!documentId) {
      toast.error('Document ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeStatus({
        statusId: status.statusId,
        isComplete,
        comments: `Status '${title}' marked as ${isComplete ? 'complete' : 'incomplete'}`
      });

      onSuccess();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              className="col-span-3 bg-gray-800/50"
              disabled
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="required" className="text-right">
              Required
            </Label>
            <Switch
              id="required"
              checked={isRequired}
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="complete" className="text-right">
              Complete
            </Label>
            <Switch
              id="complete"
              checked={isComplete}
              onCheckedChange={setIsComplete}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
