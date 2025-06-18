import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import api from "@/services/api";
import { DocumentStatus } from "@/models/documentCircuit";

interface DeleteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: DocumentStatus | null;
  onSuccess: () => void;
}

export function DeleteStatusDialog({
  open,
  onOpenChange,
  status,
  onSuccess,
}: DeleteStatusDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!status) return;

    setIsDeleting(true);
    try {
      // Update to use new Status API endpoint
      await api.delete(`/Status/${status.statusId}`);
      toast.success("Status deleted successfully");

      // Call onSuccess and close the dialog
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting status:", error);
      toast.error("Failed to delete status");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!status) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-red-500/30 text-white shadow-[0_0_25px_rgba(239,68,68,0.2)] rounded-xl max-w-md w-full">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-red-100">
              Delete Status
            </DialogTitle>
          </div>
          <DialogDescription className="text-red-300">
            Are you sure you want to delete the status{" "}
            <span className="font-semibold text-white">{status.title}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 bg-red-900/20 backdrop-blur-sm p-4 rounded-lg border border-red-900/30">
          <div className="flex items-center text-red-300 text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>
              Deleting a status may affect document workflows that use this
              status. Make sure no documents are currently using this status
              before deleting.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
