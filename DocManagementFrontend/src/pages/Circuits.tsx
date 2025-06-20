import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CreateCircuitDialog from "@/components/circuits/CreateCircuitDialog";
import EditCircuitDialog from "@/components/circuits/EditCircuitDialog";
import CircuitActivationDialog from "@/components/circuits/CircuitActivationDialog";
import CircuitDeactivationDialog from "@/components/circuits/CircuitDeactivationDialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  GitBranch,
  Eye,
  Edit,
  Trash,
  AlertCircle,
  Filter,
  Loader2,
  X,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import { Link, useNavigate } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";

export default function CircuitsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [searchField, setSearchField] = useState("all");
  const [selectedCircuits, setSelectedCircuits] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loadingCircuits, setLoadingCircuits] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [circuitToActivate, setCircuitToActivate] = useState<Circuit | null>(null);
  const [circuitToDeactivate, setCircuitToDeactivate] = useState<Circuit | null>(null);

  const isSimpleUser = user?.role === "SimpleUser";

  // Load circuits
  const fetchCircuits = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const circuits = await circuitService.getAllCircuits();
      setCircuits(circuits || []);
    } catch (error: any) {
      console.error("Error fetching circuits:", error);
      setIsError(true);
      setApiError(error?.message || "Failed to load circuits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCircuits();
  }, []);

  // Clear API errors when user changes
  useEffect(() => {
    setApiError("");
  }, [user]);

  // Handle circuit created
  const handleCircuitCreated = () => {
    fetchCircuits();
  };

  // Filter circuits
  const filteredCircuits = circuits.filter((circuit) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (searchField === "all" &&
          (circuit.circuitKey?.toLowerCase().includes(query) ||
            circuit.title?.toLowerCase().includes(query) ||
            circuit.descriptif?.toLowerCase().includes(query))) ||
        (searchField === "code" &&
          circuit.circuitKey?.toLowerCase().includes(query)) ||
        (searchField === "title" &&
          circuit.title?.toLowerCase().includes(query)) ||
        (searchField === "description" &&
          circuit.descriptif?.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter === "active" && !circuit.isActive) return false;
    if (statusFilter === "inactive" && circuit.isActive) return false;

    return true;
  });

  // Use pagination hook (same as UserTable)
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCircuits,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredCircuits || [],
    initialPageSize: 15,
  });

  // Handle toggle circuit active status
  const handleToggleActive = async (circuit: Circuit) => {
    if (isSimpleUser) return;

    // For activation, show the activation dialog
    if (!circuit.isActive) {
      setCircuitToActivate(circuit);
      return;
    }

    // For deactivation, show the deactivation dialog
    setCircuitToDeactivate(circuit);
  };

  // Handle activation after dialog confirmation
  const performToggle = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);
    try {
      await circuitService.toggleCircuitActivation(circuit);
      await fetchCircuits();
      toast.success("Circuit activated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to activate circuit");
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  // Handle deactivation after dialog confirmation
  const performDeactivation = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);
    try {
      await circuitService.toggleCircuitActivation(circuit);
      await fetchCircuits();
      toast.success("Circuit deactivated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to deactivate circuit");
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  // Handle delete circuit
  const handleDelete = async () => {
    if (!selectedCircuit || isSimpleUser) return;

    try {
      await circuitService.deleteCircuit(selectedCircuit.id);
      await fetchCircuits();
      toast.success("Circuit deleted successfully");
      setDeleteOpen(false);
      setSelectedCircuit(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete circuit");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCircuits.length === 0 || isSimpleUser) return;

    try {
      await Promise.all(
        selectedCircuits.map((id) => circuitService.deleteCircuit(id))
      );
      await fetchCircuits();
      toast.success(`${selectedCircuits.length} circuits deleted successfully`);
      setSelectedCircuits([]);
      setBulkDeleteOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete circuits");
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Selection handlers (same as UserTable)
  const handleSelectAll = () => {
    const currentPageCircuitIds = paginatedCircuits.map(
      (circuit) => circuit.id
    );
    const allCurrentSelected = currentPageCircuitIds.every((id) =>
      selectedCircuits.includes(id)
    );

    if (allCurrentSelected) {
      // If all current page circuits are selected, deselect them
      const newSelected = selectedCircuits.filter(
        (id) => !currentPageCircuitIds.includes(id)
      );
      setSelectedCircuits(newSelected);
    } else {
      // If not all current page circuits are selected, select them all
      const newSelected = [
        ...selectedCircuits.filter((id) => !currentPageCircuitIds.includes(id)),
        ...currentPageCircuitIds,
      ];
      setSelectedCircuits(newSelected);
    }
  };

  const handleSelectCircuit = (circuitId: number) => {
    setSelectedCircuits((prev) =>
      prev.includes(circuitId)
        ? prev.filter((id) => id !== circuitId)
        : [...prev, circuitId]
    );
  };

  // Define actions for PageLayout
  const actions = !isSimpleUser
    ? [
        {
          label: "New Circuit",
          onClick: () => setCreateOpen(true),
          icon: Plus,
          variant: "default" as const,
        },
      ]
    : [];

  // Professional filter/search bar styling (matching UserTable)
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Search field options
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "code", label: "Circuit Code" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
  ];

  // Status options
  const statusOptions = [
    { id: "any", label: "Any Status", value: "any" },
    { id: "active", label: "Active", value: "active" },
    { id: "inactive", label: "Inactive", value: "inactive" },
  ];

  // Apply filters immediately when changed
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  // Get sort icon (same as UserTable)
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );
  };

  const headerClass = (field: string) => `
    text-foreground font-medium cursor-pointer select-none
    hover:text-primary transition-colors duration-150
    ${sortBy === field ? "text-primary" : ""}
  `;

  // Generate circuit avatar initials
  const getCircuitInitials = (circuit: Circuit) => {
    if (circuit.circuitKey) {
      return circuit.circuitKey.slice(0, 2).toUpperCase();
    }
    if (circuit.title) {
      const words = circuit.title.split(" ").filter((word) => word.length > 0);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return words[0]?.slice(0, 2).toUpperCase() || "C";
    }
    return "C";
  };

  // Check if we have circuits to display
  const hasCircuits = circuits && circuits.length > 0;

  if (isLoading) {
    return (
      <PageLayout
        title="Circuit Management"
        subtitle={
          isSimpleUser
            ? "View document workflow circuits"
            : "Create and manage document workflow circuits"
        }
        icon={GitBranch}
        actions={actions}
      >
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading circuits...</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout
        title="Circuit Management"
        subtitle={
          isSimpleUser
            ? "View document workflow circuits"
            : "Create and manage document workflow circuits"
        }
        icon={GitBranch}
        actions={actions}
      >
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive font-bold">!</span>
                </div>
                <p className="text-destructive">
                  Failed to load circuits. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Circuit Management"
      subtitle={
        isSimpleUser
          ? "View document workflow circuits"
          : "Create and manage document workflow circuits"
      }
      icon={GitBranch}
      actions={actions}
    >
      {/* Dialogs */}
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      {selectedCircuit && (
        <>
          <EditCircuitDialog
            circuit={selectedCircuit}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSuccess={() => {
              fetchCircuits();
              setEditOpen(false);
              setSelectedCircuit(null);
            }}
          />

          <DeleteConfirmDialog
            title="Delete Circuit"
            description={`Are you sure you want to delete the circuit "${selectedCircuit.title}"? This action cannot be undone.`}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDelete}
            confirmText="Delete"
            destructive={true}
          />
        </>
      )}

      <DeleteConfirmDialog
        title="Delete Circuits"
        description={`Are you sure you want to delete ${selectedCircuits.length} circuits? This action cannot be undone.`}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        confirmText="Delete"
        destructive={true}
      />

      {/* Circuit Activation Dialog */}
      {circuitToActivate && (
        <CircuitActivationDialog
          isOpen={true}
          onClose={() => setCircuitToActivate(null)}
          circuit={circuitToActivate}
          onActivate={() => {
            performToggle(circuitToActivate);
            setCircuitToActivate(null);
          }}
        />
      )}

      {/* Circuit Deactivation Dialog */}
      {circuitToDeactivate && (
        <CircuitDeactivationDialog
          isOpen={true}
          onClose={() => setCircuitToDeactivate(null)}
          circuit={circuitToDeactivate}
          onDeactivate={() => {
            performDeactivation(circuitToDeactivate);
            setCircuitToDeactivate(null);
          }}
        />
      )}

      {/* API Error Alert */}
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

      <div
        className="h-full flex flex-col gap-6 w-full"
        style={{ minHeight: "100%" }}
      >
        {/* Document-style Search + Filter Bar (exactly like UserTable) */}
        <div className={filterCardClass}>
          {/* Search and field select */}
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="relative">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                  <SelectValue>
                    {searchFields.find((opt) => opt.id === searchField)
                      ?.label || "All fields"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                  {searchFields.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id}
                      className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <Input
                placeholder="Search circuits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter popover */}
          <div className="flex items-center gap-3">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
                >
                  <Filter className="h-5 w-5" />
                  Filter
                  {statusFilter !== "any" && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
                <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filter Circuits
                </div>
                <div className="flex flex-col gap-4">
                  {/* Status Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-popover-foreground">
                      Status
                    </span>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                        <SelectValue>
                          {
                            statusOptions.find(
                              (opt) => opt.value === statusFilter
                            )?.label
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                        {statusOptions.map((opt) => (
                          <SelectItem
                            key={opt.id}
                            value={opt.value}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  {statusFilter !== "any" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                      onClick={clearAllFilters}
                    >
                      <X className="h-4 w-4" /> Clear All
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table Container (exactly like UserTableContent) */}
        <div
          className="h-full flex flex-col gap-4"
          style={{ minHeight: "100%" }}
        >
          <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

            {hasCircuits && filteredCircuits.length > 0 ? (
              <div className="relative h-full flex flex-col z-10">
                {/* Fixed Header - Never Scrolls (exactly like UserTableHeader) */}
                <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                  <div className="min-w-[1026px]">
                    <Table className="table-fixed w-full">
                      <TableHeader className="bg-muted/20 backdrop-blur-sm">
                        <TableRow className="border-border/30 hover:bg-transparent">
                          <TableHead className="w-[48px]">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={
                                  selectedCircuits.filter((id) =>
                                    paginatedCircuits.some(
                                      (circuit) => circuit.id === id
                                    )
                                  ).length > 0 &&
                                  selectedCircuits.filter((id) =>
                                    paginatedCircuits.some(
                                      (circuit) => circuit.id === id
                                    )
                                  ).length === paginatedCircuits.length
                                }
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all"
                                className="border-blue-400 dark:border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                              />
                            </div>
                          </TableHead>
                          <TableHead className="w-[48px]"></TableHead>
                          <TableHead
                            className={`${headerClass("circuitKey")} w-[200px]`}
                            onClick={() => handleSort("circuitKey")}
                          >
                            <div className="flex items-center">
                              Circuit {renderSortIcon("circuitKey")}
                            </div>
                          </TableHead>
                          <TableHead
                            className={`${headerClass("title")} w-[280px]`}
                            onClick={() => handleSort("title")}
                          >
                            <div className="flex items-center">
                              Title {renderSortIcon("title")}
                            </div>
                          </TableHead>
                          <TableHead
                            className={`${headerClass(
                              "documentType"
                            )} w-[150px]`}
                            onClick={() => handleSort("documentType")}
                          >
                            <div className="flex items-center">
                              Type {renderSortIcon("documentType")}
                            </div>
                          </TableHead>
                          <TableHead
                            className={`${headerClass("isActive")} w-[120px]`}
                            onClick={() => handleSort("isActive")}
                          >
                            <div className="flex items-center">
                              Status {renderSortIcon("isActive")}
                            </div>
                          </TableHead>
                          <TableHead className="text-foreground font-medium w-[100px]">
                            Block
                          </TableHead>
                          <TableHead className="w-[80px] text-foreground font-medium text-right pr-4">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>
                </div>

                {/* Scrollable Body - Only Content Scrolls (exactly like UserTableBody) */}
                <div
                  className="flex-1 overflow-hidden"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  <ScrollArea className="table-scroll-area h-full w-full">
                    <div className="min-w-[1026px] pb-4">
                      <Table className="table-fixed w-full">
                        <TableBody>
                          {paginatedCircuits.map((circuit) => (
                            <TableRow
                              key={circuit.id}
                              className={`border-blue-200 dark:border-blue-900/30 transition-all duration-150 cursor-pointer ${
                                selectedCircuits.includes(circuit.id)
                                  ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-500"
                                  : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                              onClick={() => navigate(`/circuits/${circuit.id}/statuses`)}
                            >
                              <TableCell className="w-[48px]" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={selectedCircuits.includes(
                                      circuit.id
                                    )}
                                    onCheckedChange={() =>
                                      handleSelectCircuit(circuit.id)
                                    }
                                    aria-label={`Select circuit ${circuit.circuitKey}`}
                                    className="border-blue-400 dark:border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="w-[48px]">
                                <Avatar className="border-2 border-blue-300 dark:border-blue-900/50 h-9 w-9">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                                    {getCircuitInitials(circuit)}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="w-[200px]">
                                <div className="font-medium text-blue-900 dark:text-blue-100">
                                  {circuit.title}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  @{circuit.circuitKey}
                                </div>
                              </TableCell>
                              <TableCell className="w-[280px] text-blue-800 dark:text-blue-200">
                                <span className="block truncate">
                                  {circuit.descriptif || "No description"}
                                </span>
                              </TableCell>
                              <TableCell className="w-[150px]">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-800/30 text-blue-200 border-blue-600/50"
                                >
                                  {circuit.documentType?.typeName || "No type"}
                                </Badge>
                              </TableCell>
                              <TableCell className="w-[120px]">
                                {circuit.isActive ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/30"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-900/30"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="w-[100px]" onClick={(e) => e.stopPropagation()}>
                                {!isSimpleUser && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center">
                                          <Switch
                                            checked={circuit.isActive}
                                            onCheckedChange={() =>
                                              handleToggleActive(circuit)
                                            }
                                            disabled={loadingCircuits.includes(
                                              circuit.id
                                            )}
                                            className={
                                              circuit.isActive
                                                ? "bg-emerald-600 data-[state=checked]:bg-emerald-600"
                                                : "bg-red-600 data-[state=unchecked]:bg-red-600"
                                            }
                                          />
                                          {loadingCircuits.includes(
                                            circuit.id
                                          ) && (
                                            <Loader2 className="h-3 w-3 animate-spin text-blue-400 ml-2" />
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="bg-white dark:bg-blue-900/90 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-500/30"
                                      >
                                        {circuit.isActive
                                          ? "Deactivate Circuit"
                                          : "Activate Circuit"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </TableCell>
                              <TableCell className="w-[80px] text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 rounded-lg shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/circuits/${circuit.id}/statuses`)
                                      }
                                      className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
                                    >
                                      <CheckCircle2 className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <span>View Statuses</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/circuits/${circuit.id}/steps`)
                                      }
                                      className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
                                    >
                                      <GitBranch className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <span>View Steps</span>
                                    </DropdownMenuItem>
                                    {!isSimpleUser && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedCircuit(circuit);
                                            setEditOpen(true);
                                          }}
                                          className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
                                        >
                                          <Edit className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                          <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedCircuit(circuit);
                                            setDeleteOpen(true);
                                          }}
                                          className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-900 dark:hover:text-red-200 rounded-md focus:bg-red-100 dark:focus:bg-red-900/30 focus:text-red-900 dark:focus:text-red-200 px-3 py-2 cursor-pointer"
                                        >
                                          <Trash className="mr-2.5 h-4 w-4" />
                                          <span>Delete</span>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="relative h-full flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <GitBranch className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No circuits found.</p>
                  {statusFilter !== "any" && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Smart Pagination (exactly like UserTable) - Debug: Always show */}
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Bulk Actions Bar (exactly like UserTable) */}
        {selectedCircuits.length > 0 && !isSimpleUser && (
          <>
            {createPortal(
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
                      <span className="font-bold text-blue-100">
                        {selectedCircuits.length}
                      </span>{" "}
                      circuits selected
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
                      onClick={() => setBulkDeleteOpen(true)}
                    >
                      <Trash className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>,
              document.body
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
