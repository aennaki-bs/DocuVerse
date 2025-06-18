import { useAuth } from "@/context/AuthContext";
import { useCircuitList } from "./hooks/useCircuitList";
import { CircuitListContent } from "./CircuitListContent";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { Trash, GitBranch } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface CircuitsListProps {
  onApiError?: (errorMessage: string) => void;
  searchQuery?: string;
  statusFilter?: string;
}

export default function CircuitsList({
  onApiError,
  searchQuery = "",
  statusFilter = "any",
}: CircuitsListProps) {
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";

  const {
    circuits,
    isLoading,
    isError,
    selectedCircuit,
    selectedCircuits,
    sortConfig,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    handleEdit,
    handleDelete,
    handleViewDetails,
    handleSelectCircuit,
    handleSelectAll,
    openBulkDeleteDialog,
    confirmBulkDelete,
    requestSort,
    confirmDelete,
    refetch,
  } = useCircuitList({
    onApiError,
    searchQuery,
    statusFilter,
  });

  // Refresh data when component mounts or when searchQuery/statusFilter changes
  useEffect(() => {
    refetch();
  }, [searchQuery, statusFilter, refetch]);

  return (
    <>
      <CircuitListContent
        circuits={circuits}
        isLoading={isLoading}
        isError={isError}
        isSimpleUser={isSimpleUser}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        selectedCircuit={selectedCircuit}
        selectedCircuits={selectedCircuits}
        sortConfig={sortConfig}
        editDialogOpen={editDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onSelectCircuit={handleSelectCircuit}
        onSelectAll={handleSelectAll}
        onSort={requestSort}
        onBulkDelete={openBulkDeleteDialog}
        setEditDialogOpen={setEditDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setDetailsDialogOpen={setDetailsDialogOpen}
        confirmDelete={confirmDelete}
        refetch={refetch}
      />

      {/* Bulk delete confirmation dialog */}
      <DeleteConfirmDialog
        title="Delete Circuits"
        description={`Are you sure you want to delete ${selectedCircuits.length} selected circuits? This action cannot be undone.`}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={confirmBulkDelete}
        confirmText="Delete"
        destructive={true}
      />

      {/* Bulk actions bar */}
      <AnimatePresence>
        {!isSimpleUser && selectedCircuits.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedCircuits.length}
            entityName="circuit"
            actions={[
              {
                id: "delete",
                label: "Delete",
                icon: <Trash className="h-4 w-4" />,
                onClick: openBulkDeleteDialog,
                variant: "destructive",
                className:
                  "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
              },
            ]}
            icon={<GitBranch className="w-5 h-5 text-blue-400" />}
          />
        )}
      </AnimatePresence>
    </>
  );
}
