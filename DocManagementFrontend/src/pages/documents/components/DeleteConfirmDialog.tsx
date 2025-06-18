import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash } from "lucide-react";
import { motion } from "framer-motion";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isBulk?: boolean;
  count: number;
}

const MotionAlertDialogContent = motion.create(AlertDialogContent);

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isBulk = false,
  count,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <MotionAlertDialogContent
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-md w-full"
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-xl text-blue-100">
              Confirm Delete
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-blue-300">
            {!isBulk
              ? "Are you sure you want to delete this document? This action cannot be undone."
              : `Are you sure you want to delete ${count} selected document${
                  count !== 1 ? "s" : ""
                }? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200 flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            {isBulk
              ? `Delete ${count} Document${count !== 1 ? "s" : ""}`
              : "Delete Document"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </MotionAlertDialogContent>
    </AlertDialog>
  );
}
