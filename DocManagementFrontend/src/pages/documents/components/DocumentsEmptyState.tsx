import { useState } from "react";
import { Button } from "@/components/ui/button";
import { File, Plus, FilterX, Search } from "lucide-react";
import { useDocumentsFilter } from "../hooks/useDocumentsFilter";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import { motion } from "framer-motion";

interface DocumentsEmptyStateProps {
  canManageDocuments: boolean;
  onDocumentCreated?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function DocumentsEmptyState({
  canManageDocuments,
  onDocumentCreated,
  hasFilters = false,
  onClearFilters,
}: DocumentsEmptyStateProps) {
  const { searchQuery, dateRange, activeFilters } = useDocumentsFilter();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isSearching = !!searchQuery;

  return (
    <motion.div
      className="text-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto h-20 w-20 rounded-full bg-blue-900/30 border border-blue-800/50 flex items-center justify-center mb-4 shadow-inner">
        {hasFilters ? (
          <FilterX className="h-10 w-10 text-blue-400/80" />
        ) : isSearching ? (
          <Search className="h-10 w-10 text-blue-400/80" />
        ) : (
          <File className="h-10 w-10 text-blue-400/80" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {hasFilters ? "No matching documents" : "No documents found"}
      </h3>

      <p className="mt-2 text-sm text-blue-300/80 max-w-md mx-auto">
        {hasFilters ? (
          <>
            No documents match your current filter criteria. Try adjusting your
            filters or clearing them to see all documents.
          </>
        ) : searchQuery ? (
          <>
            No documents match your search for{" "}
            <span className="text-blue-300 font-medium">"{searchQuery}"</span>.
            Try a different search term or browse all documents.
          </>
        ) : canManageDocuments ? (
          <>
            Get started by creating your first document. You can upload files,
            create new documents, and organize them into categories.
          </>
        ) : (
          <>
            There are currently no documents available for viewing. Please check
            back later or contact an administrator.
          </>
        )}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 min-w-[160px]"
            onClick={onClearFilters}
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {canManageDocuments && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 min-w-[160px]"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        )}
      </div>

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          if (onDocumentCreated) onDocumentCreated();
        }}
      />
    </motion.div>
  );
}
