
import { SubType } from '@/models/subtype';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubTypeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subType: SubType;
  onConfirm: () => void;
}

const SubTypeDeleteDialog = ({
  open,
  onOpenChange,
  subType,
  onConfirm,
}: SubTypeDeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription className="text-blue-300">
            Are you sure you want to delete the subtype "{subType.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3">
          <p className="text-white mb-2">
            Subtype Details:
          </p>
          <ul className="text-sm text-blue-200 space-y-1 ml-2">
            <li><span className="text-blue-400">Key:</span> {subType.subTypeKey}</li>
            <li><span className="text-blue-400">Document Type:</span> {subType.documentType?.typeName || `Type ID: ${subType.documentTypeId}`}</li>
            <li><span className="text-blue-400">Status:</span> {subType.isActive ? 'Active' : 'Inactive'}</li>
          </ul>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3 mt-4">
            <p className="text-red-300 text-sm">
              <strong>Warning:</strong> If this subtype is used by any documents, you will not be able to delete it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-blue-900/50 text-blue-400 hover:bg-blue-900/30"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubTypeDeleteDialog;
