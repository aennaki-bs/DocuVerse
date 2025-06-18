import { Trash, Layers } from "lucide-react";
import { BulkActionsBar, BulkAction } from "@/components/shared/BulkActionsBar";
import { AnimatePresence } from "framer-motion";

interface BottomActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  selectedCount,
  onBulkDelete,
}) => {
  if (selectedCount === 0) return null;

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: onBulkDelete,
      variant: "destructive",
      className:
        "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
    },
  ];

  return (
    <AnimatePresence>
      <BulkActionsBar
        selectedCount={selectedCount}
        entityName="document type"
        actions={bulkActions}
        icon={<Layers className="w-5 h-5 text-blue-400" />}
      />
    </AnimatePresence>
  );
};

export default BottomActionBar;
