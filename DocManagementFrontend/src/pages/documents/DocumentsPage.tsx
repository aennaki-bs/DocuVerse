import { useState, useEffect } from "react";
import { useDocumentsData } from "./hooks/useDocumentsData";
import DocumentsHeader from "./components/DocumentsHeader";
import DocumentsTable from "./components/DocumentsTable";
import DocumentsEmptyState from "./components/DocumentsEmptyState";
import DocumentsFilterBar from "./components/DocumentsFilterBar";
import SelectedDocumentsBar from "./components/SelectedDocumentsBar";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { Document } from "@/models/document";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  FileText,
  Plus,
  GitBranch,
  Trash2,
  AlertCircle,
  FilterX,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import { useDocumentsFilter } from "./hooks/useDocumentsFilter";

const DocumentsPage = () => {
  const { t, tWithParams } = useTranslation();
  const { user } = useAuth();
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  const {
    documents,
    filteredItems,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    useFakeData,
    sortConfig,
    setSortConfig,
    requestSort,
  } = useDocumentsData();

  // Get filter state to check if filters are applied
  const { activeFilters, resetFilters } = useDocumentsFilter();

  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(
    null
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredItems.length / pageSize));
    setPage(1); // Reset to first page when filters change
  }, [filteredItems, pageSize]);

  // Check if any filters are applied
  const hasActiveFilters =
    activeFilters.searchQuery !== "" ||
    activeFilters.statusFilter !== "any" ||
    activeFilters.typeFilter !== "any" ||
    activeFilters.dateRange !== undefined;

  const getPageDocuments = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredItems.slice(start, end);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSelectDocument = (documentId: number) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === getPageDocuments().length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(getPageDocuments().map((doc) => doc.id));
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const openDeleteSingleDialog = (documentId: number) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (documentToDelete !== null) {
        // Single document delete
        await deleteDocument(documentToDelete);
        toast.success(t("documents.documentDeleted"));
      } else if (selectedDocuments.length > 0) {
        // Multiple documents delete with improved error handling
        try {
          const results = await deleteMultipleDocuments(selectedDocuments);

          // All deletions were successful
          if (results.successful.length === selectedDocuments.length) {
            toast.success(
              tWithParams("documents.documentsDeleted", { count: results.successful.length })
            );
          }
        } catch (error: any) {
          // Handle partial success/failure
          if (error.results) {
            const { successful, failed } = error.results;

            if (successful.length > 0 && failed.length > 0) {
              // Partial success
              toast.success(
                tWithParams("documents.documentsDeleted", { count: successful.length })
              );
              toast.error(
                tWithParams("documents.failedToDeleteSome", { count: failed.length })
              );
            } else if (successful.length === 0) {
              // Complete failure
              toast.error(
                tWithParams("documents.failedToDeleteAll", { count: failed.length })
              );
            }
          } else {
            // Generic error
            toast.error(t("documents.deleteError"));
          }

          // Don't return early - we still want to clean up the UI state
        }
      }

      // Clean up UI state regardless of success/failure
      setSelectedDocuments([]);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);

      // Fetch documents to refresh the list (this will show what was actually deleted)
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document(s):", error);
      toast.error(t("documents.deleteError"));

      // Still clean up UI state on error
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const openAssignCircuitDialog = (document: Document) => {
    setDocumentToAssign(document);
    setAssignCircuitDialogOpen(true);
  };

  const handleAssignCircuitSuccess = () => {
    setAssignCircuitDialogOpen(false);
    setDocumentToAssign(null);
    fetchDocuments();
    toast.success(t("documents.circuitAssigned"));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={t("documents.title")}
        description={t("documents.subtitle")}
        icon={<FileText className="h-6 w-6 text-blue-500" />}
        actions={
          <>
            {canManageDocuments ? (
              <>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4" /> {t("documents.newDocument")}
                </Button>

                {selectedDocuments.length === 1 && (
                  <Button
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    onClick={() =>
                      openAssignCircuitDialog(
                        documents.find((d) => d.id === selectedDocuments[0])!
                      )
                    }
                  >
                    <GitBranch className="mr-2 h-4 w-4" /> {t("documents.assignToCircuit")}
                  </Button>
                )}
              </>
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                <Plus className="mr-2 h-4 w-4" /> {t("documents.newDocument")}
              </Button>
            )}
          </>
        }
      />

      {/* Filter Bar */}
      <DocumentsFilterBar />

      {/* Selected Documents Bar */}
      <AnimatePresence>
        {selectedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <BulkActionsBar
              selectedCount={selectedDocuments.length}
              entityName="document"
              icon={<FileText className="h-4 w-4 text-blue-400" />}
              actions={[
                {
                  id: "delete",
                  label: t("documents.deleteSelected"),
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: openDeleteDialog,
                  variant: "destructive",
                },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Card className="mt-6 border-gray-800 bg-[#0d1117]/60 backdrop-blur-sm shadow-md">
        {isLoading ? (
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">{t("documents.loading")}</p>
            </div>
          </CardContent>
        ) : filteredItems.length === 0 ? (
          <DocumentsEmptyState
            canManageDocuments={canManageDocuments}
            onDocumentCreated={fetchDocuments}
            hasFilters={hasActiveFilters}
            onClearFilters={resetFilters}
          />
        ) : (
          <>
            <CardContent className="p-0">
              <DocumentsTable
                documents={getPageDocuments()}
                selectedDocuments={selectedDocuments}
                canManageDocuments={canManageDocuments}
                handleSelectDocument={handleSelectDocument}
                handleSelectAll={handleSelectAll}
                openDeleteDialog={openDeleteSingleDialog}
                openAssignCircuitDialog={openAssignCircuitDialog}
                sortConfig={sortConfig}
                requestSort={requestSort}
                page={page}
                pageSize={pageSize}
              />
            </CardContent>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-800">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => handlePageChange(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(Math.min(totalPages, page + 1))
                        }
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        count={documentToDelete ? 1 : selectedDocuments.length}
      />

      {/* Assign Circuit Dialog */}
      {documentToAssign && (
        <AssignCircuitDialog
          open={assignCircuitDialogOpen}
          onOpenChange={setAssignCircuitDialogOpen}
          documentId={documentToAssign.id}
          documentKey={documentToAssign.documentKey}
          documentTypeId={documentToAssign.typeId}
          onSuccess={handleAssignCircuitSuccess}
        />
      )}

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};

export default DocumentsPage;
