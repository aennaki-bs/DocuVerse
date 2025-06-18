import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedCount: number;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
}: BulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-red-500/30 text-white shadow-[0_0_25px_rgba(239,68,68,0.2)] rounded-xl max-w-md w-full"
        aria-describedby="delete-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-red-100">
              Delete Selected Users
            </DialogTitle>
          </div>
          <DialogDescription id="delete-description" className="text-red-300">
            Are you sure you want to delete {selectedCount} user
            {selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 bg-red-900/20 backdrop-blur-sm p-4 rounded-lg border border-red-900/30">
          <div className="flex items-center text-red-300 text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>
              Deleting users will remove all their account information and
              access to the system. Associated logs and audit trails will be
              preserved.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200 flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Delete {selectedCount} User{selectedCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
