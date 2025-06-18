import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Unlock } from "lucide-react";
import { motion } from "framer-motion";

interface BlockUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  isBlocked: boolean;
}

const MotionAlertDialogContent = motion.create(AlertDialogContent);

export function BlockUserDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  userName,
  isBlocked,
}: BlockUserDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <MotionAlertDialogContent
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-md w-full"
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            {isBlocked ? (
              <div className="p-2 rounded-full bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-green-500/10 text-green-400">
                <Unlock className="h-5 w-5" />
              </div>
            )}
            <AlertDialogTitle className="text-xl text-blue-100">
              {isBlocked ? "Block User" : "Unblock User"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-blue-300">
            Are you sure you want to {isBlocked ? "block" : "unblock"}{" "}
            <span className="font-medium text-blue-200">{userName}</span>?
            {isBlocked && " This will prevent them from accessing the system."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isBlocked
                ? "bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
                : "bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-200"
            }
          >
            {isBlocked ? "Block User" : "Unblock User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </MotionAlertDialogContent>
    </AlertDialog>
  );
}
