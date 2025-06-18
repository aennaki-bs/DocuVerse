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
              onClick={onDelete}
              size="sm"
              variant="destructive"
              className="bg-red-600/80 hover:bg-red-700 text-white border-red-500/30 shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
