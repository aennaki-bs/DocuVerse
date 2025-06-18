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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DocumentStatus } from '@/models/documentCircuit';
import api from '@/services/api';

interface SimpleStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  targetStatus?: DocumentStatus;
  currentStatusTitle: string;
  onSuccess: () => void;
}

export function SimpleStatusDialog({
  open,
  onOpenChange,
  documentId,
  targetStatus,
  currentStatusTitle,
  onSuccess
}: SimpleStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  if (!targetStatus) return null;

  const handleSubmit = async () => {
    if (!documentId || !targetStatus) {
      toast.error('Missing required information');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Sending status change request:', {
        documentId,
        targetStatusId: targetStatus.statusId,
        comments: comments || `Changed status from ${currentStatusTitle} to ${targetStatus.title}`
      });
      
      const response = await api.post('/Workflow/move-to-status', {
        documentId,
        targetStatusId: targetStatus.statusId,
        comments: comments || `Changed status from ${currentStatusTitle} to ${targetStatus.title}`
      });

      console.log('Status change response:', response);
      toast.success(`Document status changed to ${targetStatus.title}`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data || 'Failed to change document status';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Status change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a1033] border border-blue-900/50 text-white">
        <DialogHeader>
          <DialogTitle>Change Document Status</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <p className="text-gray-400 mb-2">
              This will change the document status from "{currentStatusTitle}" to "{targetStatus.title}".
            </p>
            {targetStatus.isFlexible && (
              <p className="text-purple-400 text-xs">
                This is a flexible status that can be used at any point in the workflow.
              </p>
            )}
          </div>
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
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 p-2 rounded text-xs text-red-300">
              {error}
            </div>
          )}
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
            {isSubmitting ? 'Updating...' : 'Change Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 