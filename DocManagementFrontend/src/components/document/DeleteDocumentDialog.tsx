
import { AlertCircle, Ban, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDocumentDialog = ({ isOpen, onClose, onConfirm }: DeleteDocumentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-red-900/80 border-white/10 text-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-300">
            <AlertCircle className="h-5 w-5 mr-2" /> Confirm Delete
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-400/30 text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            <Ban className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
          >
            <Trash className="h-4 w-4 mr-2" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocumentDialog;
