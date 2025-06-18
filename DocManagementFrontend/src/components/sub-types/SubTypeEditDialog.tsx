import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SubType } from '@/models/subtype';
import { DocumentType } from '@/models/document';
import { format } from 'date-fns';

interface SubTypeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subType: SubType;
  onSubmit: (data: any) => void;
  documentTypes: DocumentType[];
}

const SubTypeEditDialog = ({
  open,
  onOpenChange,
  subType,
  onSubmit,
  documentTypes,
}: SubTypeEditDialogProps) => {
  const [editedSubType, setEditedSubType] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    documentTypeId: 0,
  });

  useEffect(() => {
    if (subType) {
      setEditedSubType({
        name: subType.name,
        description: subType.description,
        startDate: new Date(subType.startDate).toISOString().split('T')[0],
        endDate: new Date(subType.endDate).toISOString().split('T')[0],
        isActive: subType.isActive,
        documentTypeId: subType.documentTypeId,
      });
    }
  }, [subType]);

  const handleEditSubmit = () => {
    onSubmit({
      ...editedSubType,
      documentTypeId: editedSubType.documentTypeId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subtype</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input
              id="edit-name"
              value={editedSubType.name}
              onChange={(e) => setEditedSubType({ ...editedSubType, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={editedSubType.description}
              onChange={(e) => setEditedSubType({ ...editedSubType, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="edit-startDate"
              type="date"
              value={editedSubType.startDate}
              onChange={(e) => setEditedSubType({ ...editedSubType, startDate: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="edit-endDate"
              type="date"
              value={editedSubType.endDate}
              onChange={(e) => setEditedSubType({ ...editedSubType, endDate: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-isActive" className="text-right">
              Active
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="edit-isActive"
                checked={editedSubType.isActive}
                onCheckedChange={(checked) => setEditedSubType({ ...editedSubType, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">{editedSubType.isActive ? 'Yes' : 'No'}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubTypeEditDialog;
