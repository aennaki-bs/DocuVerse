import { Button } from "@/components/ui/button";
import { GitBranch, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import CreateCircuitDialog from "@/components/circuits/CreateCircuitDialog";

interface CircuitEmptyStateProps {
  searchQuery?: string;
  statusFilter?: string;
  isSimpleUser: boolean;
}

export function CircuitEmptyState({
  searchQuery,
  statusFilter,
  isSimpleUser,
}: CircuitEmptyStateProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const hasFilters = searchQuery || (statusFilter && statusFilter !== "any");

  const handleCircuitCreated = () => {
    // This will trigger a refresh in the parent component
    window.location.reload();
  };

  return (
    <>
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      <EmptyState
        icon={<GitBranch className="h-10 w-10 text-blue-400" />}
        title="No circuits found"
        description={
          hasFilters
            ? "Try adjusting your search or filters"
            : "Create your first circuit to get started"
        }
        actionLabel={!isSimpleUser && !hasFilters ? "New Circuit" : undefined}
        actionIcon={
          !isSimpleUser && !hasFilters ? (
            <Plus className="h-4 w-4" />
          ) : undefined
        }
        onAction={
          !isSimpleUser && !hasFilters ? () => setCreateOpen(true) : undefined
        }
        actionClassName="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      />
    </>
  );
}
