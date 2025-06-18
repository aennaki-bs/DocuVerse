import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAddType: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddType }) => {
  return (
    <motion.div
      className="text-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto h-20 w-20 rounded-full bg-blue-900/30 border border-blue-800/50 flex items-center justify-center mb-4 shadow-inner">
        <Layers className="h-10 w-10 text-blue-400/80" />
      </div>

      <h3 className="text-xl font-semibold text-white">
        No document types found
      </h3>

      <p className="mt-2 text-sm text-blue-300/80 max-w-md mx-auto">
        Document types help categorize your documents. Start by creating your
        first document type.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          className="bg-blue-600 hover:bg-blue-700 min-w-[160px]"
          onClick={onAddType}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Document Type
        </Button>
      </div>
    </motion.div>
  );
};

export default EmptyState;
