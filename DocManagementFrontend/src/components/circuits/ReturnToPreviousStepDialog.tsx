import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentWorkflow } from '@/hooks/useDocumentWorkflow';

interface ReturnToPreviousStepDialogProps {
  documentId: number;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ReturnToPreviousStepDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
  onSuccess
}: ReturnToPreviousStepDialogProps) {
  const [comments, setComments] = useState('');
  const { returnToPreviousStep, isActionLoading } = useDocumentWorkflow(documentId);

  const handleReturnToPrevious = async () => {
    try {
      await returnToPreviousStep(comments);
      onOpenChange(false);
      setComments('');
      onSuccess();
    } catch (error) {
      console.error('Error returning to previous step:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Return to Previous Step</DialogTitle>
          <DialogDescription>
            Return document "{documentTitle}" to the previous step in the workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Textarea
              id="comments"
              placeholder="Add comments (optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isActionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReturnToPrevious} 
            disabled={isActionLoading}
          >
            {isActionLoading ? 'Processing...' : 'Return to Previous'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 