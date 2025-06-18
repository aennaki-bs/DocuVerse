import { useState } from "react";
import { AlertCircle, Trash2, Ban } from "lucide-react";
import { Document, Ligne } from "@/models/document";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeleteLigneDialogProps {
  document: Document;
  ligne: Ligne | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Format price with MAD currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const DeleteLigneDialog = ({
  document,
  ligne,
  isOpen,
  onOpenChange,
}: DeleteLigneDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteLigne = async () => {
    if (!ligne) return;

    try {
      setIsSubmitting(true);
      await documentService.deleteLigne(ligne.id);
      toast.success("Line deleted successfully");
      onOpenChange(false);

      // Refresh document data
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({
        queryKey: ["documentLignes", document.id],
      });
    } catch (error) {
      console.error("Failed to delete line:", error);
      toast.error("Failed to delete line");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900/95 to-red-900/80 border-white/10 text-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-300">
            <AlertCircle className="h-5 w-5 mr-2" /> Confirm Delete
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-300 mb-4">
            Are you sure you want to delete this line? This will also delete all
            related sous-lignes.
          </p>
          {ligne && (
            <div className="p-4 bg-red-900/20 rounded-md border border-red-500/30 mt-4">
              <p className="font-medium text-white">{ligne.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="font-mono text-xs border-red-500/30 bg-red-900/30 text-red-300"
                >
                  {ligne.ligneKey}
                </Badge>
                <span className="text-sm text-red-300">
                  Price: {formatPrice(ligne.prix)}
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-400/30 text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            <Ban className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteLigne}
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 ${
              isSubmitting ? "opacity-70" : ""
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Line
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLigneDialog;
