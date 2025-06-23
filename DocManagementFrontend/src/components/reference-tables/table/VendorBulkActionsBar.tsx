import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Truck } from "lucide-react";

interface VendorBulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
}

export function VendorBulkActionsBar({
  selectedCount,
  onDelete,
}: VendorBulkActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-orange-600/90 to-amber-600/90 backdrop-blur-md border border-orange-500/30 rounded-full px-6 py-3 shadow-lg shadow-orange-900/20">
        <div className="flex items-center gap-4">
          {/* Icon and count */}
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 bg-white/20 rounded-full">
              <Truck className="h-4 w-4" />
            </div>
            <span className="font-medium">
              {selectedCount} vendor{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
              onClick={onDelete}
              disabled
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
