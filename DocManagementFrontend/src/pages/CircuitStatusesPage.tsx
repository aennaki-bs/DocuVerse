import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import circuitService from "@/services/circuitService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Network,
  Filter,
  X,
  RefreshCw,
  Search,
  Trash2,
  CheckSquare,
  MoreHorizontal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StatusTable } from "@/components/statuses/StatusTable";
import { StatusFormDialog } from "@/components/statuses/dialogs/StatusFormDialog";
import { DeleteStatusDialog } from "@/components/statuses/dialogs/DeleteStatusDialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentStatus } from "@/models/documentCircuit";

export default function CircuitStatusesPage() {
  const { circuitId } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";
  const queryClient = useQueryClient();

  const [apiError, setApiError] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(
    null
  );
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [statusTypeFilter, setStatusTypeFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch circuit details
  const {
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    refetch: refetchCircuit,
  } = useQuery({
    queryKey: ["circuit", circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Fetch statuses for the circuit
  const {
    data: statuses = [],
    isLoading: isStatusesLoading,
    isError: isStatusesError,
    refetch: refetchStatuses,
  } = useQuery({
    queryKey: ["circuit-statuses", circuitId],
    queryFn: () => circuitService.getCircuitStatuses(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Filter and search statuses
  const filteredStatuses = statuses.filter((status) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      status[searchField as keyof DocumentStatus]
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Apply status type filter
    let matchesType = true;
    if (statusTypeFilter !== "any") {
      switch (statusTypeFilter) {
        case "initial":
          matchesType = status.isInitial === true;
          break;
        case "final":
          matchesType = status.isFinal === true;
          break;
        case "normal":
          matchesType =
            !status.isInitial && !status.isFinal && !status.isFlexible;
          break;
        case "flexible":
          matchesType = status.isFlexible === true;
          break;
      }
    }

    return matchesSearch && matchesType;
  });

  // Handler to refresh all data after changes
  const handleRefreshData = async () => {
    try {
      // Invalidate all related queries to force a refresh
      await queryClient.invalidateQueries({ queryKey: ["circuit", circuitId] });
      await queryClient.invalidateQueries({
        queryKey: ["circuit-statuses", circuitId],
      });

      // Refetch the data
      await refetchCircuit();
      await refetchStatuses();

      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Handler logic for add/edit/delete
  const handleAddStatus = () => {
    if (circuit?.isActive) return; // Don't allow adding statuses if circuit is active
    setSelectedStatus(null);
    setFormDialogOpen(true);
  };

  const handleEditStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return; // Don't allow editing statuses if circuit is active
    setSelectedStatus(status);
    setFormDialogOpen(true);
  };

  const handleDeleteStatus = (status: DocumentStatus) => {
    if (circuit?.isActive) return; // Don't allow deleting statuses if circuit is active
    setSelectedStatus(status);
    setDeleteDialogOpen(true);
  };

  // Handle successful operations
  const handleOperationSuccess = () => {
    handleRefreshData();
    // Clear selections after operations
    setSelectedStatuses([]);
  };

  // Handle bulk selection
  const handleSelectStatus = (statusId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStatuses((prev) => [...prev, statusId]);
    } else {
      setSelectedStatuses((prev) => prev.filter((id) => id !== statusId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedStatuses(filteredStatuses.map((status) => status.statusId));
    } else {
      setSelectedStatuses([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (circuit?.isActive) {
      toast.error("Cannot delete statuses in an active circuit");
      return;
    }

    if (selectedStatuses.length === 0) {
      toast.error("No statuses selected");
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      // Implement bulk delete logic here
      // This would typically call an API endpoint that handles bulk deletion
      for (const statusId of selectedStatuses) {
        await circuitService.deleteStatus(statusId);
      }

      toast.success(`${selectedStatuses.length} statuses deleted successfully`);
      handleOperationSuccess();
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting statuses:", error);
      toast.error("Failed to delete statuses");
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusTypeFilter("any");
    setFilterOpen(false);
  };

  const isLoading = isCircuitLoading || isStatusesLoading;
  const isError = isCircuitError || isStatusesError;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-900/30 rounded w-1/3"></div>
          <div className="h-4 bg-blue-900/30 rounded w-1/4"></div>
          <div className="h-64 bg-blue-900/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !circuit) {
    return (
      <div className="p-4 md:p-6">
        <Alert
          variant="destructive"
          className="mb-4 border-red-800 bg-red-950/50 text-red-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {apiError ||
              "Failed to load circuit statuses. Please try again later."}
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link to="/circuits">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Circuits
          </Link>
        </Button>
      </div>
    );
  }

  // Status filter options
  const statusTypeOptions = [
    { id: "any", label: "Any Type", value: "any" },
    { id: "initial", label: "Initial", value: "initial" },
    { id: "final", label: "Final", value: "final" },
    { id: "normal", label: "Normal", value: "normal" },
    { id: "flexible", label: "Flexible", value: "flexible" },
  ];

  // Search field options
  const searchFieldOptions = [
    { id: "title", label: "Title", value: "title" },
    { id: "statusKey", label: "Status Key", value: "statusKey" },
    { id: "description", label: "Description", value: "description" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Modern header panel */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild className="h-9">
                <Link to="/circuits">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center">
              {circuit.title} - Statuses
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-1">
              Circuit:{" "}
              <span className="text-blue-300">{circuit.circuitKey}</span>
              {circuit.isActive && (
                <span className="ml-2 text-green-400 font-semibold">
                  (Active Circuit)
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Circuit Steps Button */}
            {!isSimpleUser && (
              <Button
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:text-blue-200"
                asChild
              >
                <Link to={`/circuit/${circuit.id}/steps`}>
                  <Network className="mr-2 h-4 w-4" /> Circuit Steps
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleRefreshData}
              className="border-blue-700/50 hover:bg-blue-900/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>

            {!isSimpleUser &&
              (circuit.isActive ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-blue-500/50 text-blue-200 cursor-not-allowed"
                        disabled
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Status
                        <AlertCircle className="ml-2 h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cannot add statuses to active circuit</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  onClick={handleAddStatus}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Status
                </Button>
              ))}
          </div>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="w-full flex flex-col md:flex-row items-center gap-2 p-4 mb-4 rounded-xl bg-[#1e2a4a] shadow-lg border border-blue-900/40">
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0 w-full">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {searchFieldOptions.find((opt) => opt.id === searchField)
                  ?.label || "Title"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {searchFieldOptions.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="hover:bg-blue-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Input
              placeholder="Search statuses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2 ml-2 ${
                statusTypeFilter !== "any" ? "border-blue-500" : ""
              }`}
            >
              <Filter className="h-4 w-4 text-blue-400" />
              Filter
              {statusTypeFilter !== "any" && (
                <Badge className="ml-1 bg-blue-600 text-white">1</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
            <div className="mb-2 text-blue-200 font-semibold">
              Filter Statuses
            </div>
            <div className="space-y-4">
              {/* Status Type Filter */}
              <div>
                <label className="text-sm text-blue-300 mb-1 block">
                  Status Type
                </label>
                <Select
                  value={statusTypeFilter}
                  onValueChange={setStatusTypeFilter}
                >
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectValue placeholder="Select status type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {statusTypeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between pt-2 border-t border-blue-900/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-blue-300 hover:text-blue-200"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFilterOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bulk actions bar */}
      {selectedStatuses.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-900/50 rounded-lg mb-4">
          <div className="flex items-center">
            <CheckSquare className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-blue-200 font-medium">
              {selectedStatuses.length} statuses selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStatuses([])}
              className="border-blue-900/50 hover:bg-blue-900/50"
            >
              Clear Selection
            </Button>
            {!circuit.isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-900/50 hover:bg-red-900/70 text-red-200"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {apiError && (
        <Alert
          variant="destructive"
          className="mb-4 border-red-800 bg-red-950/50 text-red-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <StatusTable
        statuses={filteredStatuses}
        onEdit={handleEditStatus}
        onDelete={handleDeleteStatus}
        isCircuitActive={circuit.isActive}
        selectedStatusIds={selectedStatuses}
        onSelectStatus={handleSelectStatus}
        onSelectAll={handleSelectAll}
      />

      {/* Modals */}
      {!isSimpleUser && (
        <>
          <StatusFormDialog
            open={formDialogOpen}
            onOpenChange={setFormDialogOpen}
            onSuccess={handleOperationSuccess}
            status={selectedStatus}
            circuitId={Number(circuitId)}
          />
          <DeleteStatusDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleOperationSuccess}
            status={selectedStatus}
          />
          {/* Bulk Delete Dialog */}
          {bulkDeleteDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-blue-100 mb-4">
                  Confirm Bulk Delete
                </h3>
                <p className="text-blue-200 mb-6">
                  Are you sure you want to delete {selectedStatuses.length}{" "}
                  selected statuses? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setBulkDeleteDialogOpen(false)}
                    className="border-blue-900/50 hover:bg-blue-900/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmBulkDelete}
                    className="bg-red-900/70 hover:bg-red-900 text-red-100"
                  >
                    Delete {selectedStatuses.length} Statuses
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
