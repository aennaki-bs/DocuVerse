import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DocumentTypeForm } from "@/components/document-types/DocumentTypeForm";
import { DocumentType } from "@/models/document";
import { motion, AnimatePresence } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DocumentTypeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DocumentType | null;
  onSuccess: () => void;
}

const DocumentTypeDrawer = ({
  open,
  onOpenChange,
  type,
  onSuccess,
}: DocumentTypeDrawerProps) => {
  // Use a simple handler to ensure the dialog is properly closed
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Handle successful form submission
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false); // Close the dialog when successful
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className="p-0 border-none shadow-none bg-transparent max-w-2xl mx-auto [&>button]:hidden"
            forceMount
          >
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle>
                  {type ? "Edit Document Type" : "Create Document Type"}
                </DialogTitle>
                <DialogDescription>
                  {type 
                    ? "Update the details for this document type." 
                    : "Fill in the details to create a new document type."
                  }
                </DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
            <DocumentTypeForm
              documentType={type}
              isEditMode={!!type}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DocumentTypeDrawer;
