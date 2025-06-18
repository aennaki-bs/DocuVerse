import { Button } from "@/components/ui/button";
import { Trash, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface CircuitBulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
}

export function CircuitBulkActionsBar({
  selectedCount,
  onDelete,
}: CircuitBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return createPortal(
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-r from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-lg shadow-[0_8px_32px_rgba(59,130,246,0.7)] rounded-2xl border border-blue-400/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-blue-400/40">
        <div className="flex items-center text-blue-200 font-medium">
          <div className="bg-blue-500/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
            <GitBranch className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-sm sm:text-base text-center sm:text-left">
            <span className="font-bold text-blue-100">{selectedCount}</span>{" "}
            {selectedCount === 1 ? "circuit" : "circuits"} selected
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
            onClick={onDelete}
          >
            <Trash className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
