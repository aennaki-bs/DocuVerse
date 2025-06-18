import { DocumentType } from "@/models/document";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SubTypeFormProvider } from "./components/SubTypeFormProvider";
import { MultiStepSubTypeForm } from "./components/MultiStepSubTypeForm";

interface SubTypeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  documentTypes: DocumentType[];
}

const SubTypeCreateDialog = ({
  open,
  onOpenChange,
  onSubmit,
  documentTypes,
}: SubTypeCreateDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[550px] p-5 overflow-hidden">
        <DialogHeader className="mb-2 pb-2 border-b border-blue-900/30">
          <DialogTitle className="text-xl text-white">
            Create New Series
          </DialogTitle>
          <DialogDescription className="text-blue-300 text-sm">
            Complete each step to create a new document series
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <SubTypeFormProvider
            onSubmit={onSubmit}
            onClose={handleClose}
            initialData={{ documentTypeId: documentTypes[0]?.id }}
            documentTypes={documentTypes}
          >
            <MultiStepSubTypeForm onCancel={handleClose} />
          </SubTypeFormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubTypeCreateDialog;
