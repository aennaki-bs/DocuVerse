import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DocumentStatus } from '@/models/documentCircuit';
import { useCircuitWorkflow } from '@/hooks/useCircuitWorkflow';
import { ArrowRightCircle } from 'lucide-react';

interface StatusTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  targetStatus?: DocumentStatus;
  currentStatusTitle: string;
  onSuccess: () => void;
}

export function StatusTransitionDialog({
  open,
  onOpenChange,
  documentId,
  targetStatus,
  currentStatusTitle,
  onSuccess
}: StatusTransitionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState('');
  const { moveToStatus } = useCircuitWorkflow();
  
  if (!targetStatus) return null;

  const handleSubmit = async () => {
    if (!documentId || !targetStatus) {
      toast.error('Missing required information');
      return;
    }

    setIsSubmitting(true);
    try {
      await moveToStatus({
        documentId,
        targetStatusId: targetStatus.statusId,
        comments: comments || `Changed status from ${currentStatusTitle} to ${targetStatus.title}`
      });

      toast.success(`Document status changed to ${targetStatus.title}`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change document status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfirmationMessage = () => {
    if (targetStatus.isFinal) {
      return 'This will mark the document as complete. Are you sure?';
    }
    if (targetStatus.isFlexible) {
      return 'This is a flexible status that can be used at any point in the workflow.';
    }
    return `This will change the document status from "${currentStatusTitle}" to "${targetStatus.title}".`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a1033] border border-blue-900/50 text-white">
        <DialogHeader>
          <DialogTitle>Change Document Status</DialogTitle>
          <DialogDescription className="text-gray-400">
            {getConfirmationMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="comments" className="text-blue-300">Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add optional comments about this status change"
              className="bg-[#152057] border-blue-900/50 focus:ring-blue-600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowRightCircle className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Change Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 