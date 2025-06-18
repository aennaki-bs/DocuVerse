import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CircuitListActions } from "./CircuitListActions";
import {
  ArrowUpDown,
  GitBranch,
  FileText,
  ToggleLeft,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CircuitActivationDialog from "../CircuitActivationDialog";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CircuitsTableProps {
  circuits: Circuit[];
  isSimpleUser: boolean;
  selectedCircuits: number[];
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
  onSelectCircuit: (id: number) => void;
  onSelectAll: () => void;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
  onBulkDelete: () => void;
  refetch?: () => void;
}

// Circuit Table Header Component
const CircuitTableHeader = ({
  isSimpleUser,
  selectedCount,
  totalCount,
  onSelectAll,
  sortConfig,
  onSort,
}: {
  isSimpleUser: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
}) => {
  const renderSortableHeader = (
    label: string,
    key: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none hover:text-blue-100 transition-colors duration-150"
      onClick={() => onSort(key)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {sortConfig?.key === key ? (
          <ArrowUpDown
            className="h-3.5 w-3.5 text-blue-400"
            style={{
              transform:
                sortConfig.direction === "asc"
                  ? "rotate(0deg)"
                  : "rotate(180deg)",
              opacity: 1,
            }}
          />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </div>
    </div>
  );

  return (
    <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
      <TableRow className="border-blue-900/30 hover:bg-transparent">
        {!isSimpleUser && (
          <TableHead className="w-[50px] text-blue-300 font-medium">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedCount === totalCount && totalCount > 0}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
                className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
              />
            </div>
          </TableHead>
        )}
        <TableHead className="w-[120px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Circuit Code",
            "circuitKey",
            <GitBranch className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[200px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Title",
            "title",
            <FileText className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[250px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Description",
            "descriptif",
            <Info className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[200px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Type",
            "documentType.typeName",
            <FileText className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[130px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Status",
            "isActive",
            <ToggleLeft className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[150px] text-blue-300 font-medium text-right">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

// Circuit Table Row Component
const CircuitTableRow = ({
  circuit,
  isSimpleUser,
  isSelected,
  onSelectCircuit,
  onCircuitClick,
  loadingCircuits,
  onToggleActive,
  onEdit,
  onDelete,
  onViewDetails,
  refetch,
}: {
  circuit: Circuit;
  isSimpleUser: boolean;
  isSelected: boolean;
  onSelectCircuit: (id: number) => void;
  onCircuitClick: (id: number) => void;
  loadingCircuits: number[];
  onToggleActive: (circuit: Circuit, e: React.MouseEvent) => void;
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
  refetch?: () => void;
}) => {
  return (
    <TableRow
      className={`border-blue-900/30 hover:bg-blue-900/20 transition-colors cursor-pointer ${
        isSelected ? "bg-blue-900/30 border-l-4 border-l-blue-500" : ""
      }`}
    >
      {!isSimpleUser && (
        <TableCell className="w-[50px]" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectCircuit(circuit.id)}
            className="border-blue-500/50"
          />
        </TableCell>
      )}
      <TableCell
        className="w-[120px] font-medium text-blue-100"
        onClick={() => onCircuitClick(circuit.id)}
      >
        {circuit.circuitKey}
      </TableCell>
      <TableCell
        className="w-[200px] text-blue-100"
        onClick={() => onCircuitClick(circuit.id)}
      >
        {circuit.title}
      </TableCell>
      <TableCell
        className="w-[250px] max-w-xs truncate text-blue-200/70"
        onClick={() => onCircuitClick(circuit.id)}
      >
        {circuit.descriptif || "No description"}
      </TableCell>
      <TableCell
        className="w-[200px] text-blue-200/70"
        onClick={() => onCircuitClick(circuit.id)}
      >
        {circuit.documentType ? (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-800/40 text-blue-200 text-xs"
            >
              {circuit.documentType.typeKey || "N/A"}
            </Badge>
            <span className="text-sm">{circuit.documentType.typeName}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic">No document type</span>
        )}
      </TableCell>
      <TableCell className="w-[130px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {loadingCircuits.includes(circuit.id) ? (
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          ) : (
            <Switch
              checked={circuit.isActive}
              onCheckedChange={() => {}}
              onClick={(e) => onToggleActive(circuit, e)}
              className={
                circuit.isActive ? "data-[state=checked]:bg-green-500" : ""
              }
              disabled={loadingCircuits.includes(circuit.id)}
            />
          )}
          <span
            className={`text-sm ${
              circuit.isActive ? "text-green-500" : "text-gray-400"
            }`}
          >
            {circuit.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
      <TableCell
        className="w-[150px] text-right space-x-1"
        onClick={(e) => e.stopPropagation()}
      >
        <CircuitListActions
          circuit={circuit}
          isSimpleUser={isSimpleUser}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onCircuitUpdated={refetch}
        />
      </TableCell>
    </TableRow>
  );
};

export function CircuitsTable({
  circuits,
  isSimpleUser,
  selectedCircuits,
  onEdit,
  onDelete,
  onViewDetails,
  onSelectCircuit,
  onSelectAll,
  sortConfig,
  onSort,
  onBulkDelete,
  refetch,
}: CircuitsTableProps) {
  const navigate = useNavigate();
  const [loadingCircuits, setLoadingCircuits] = useState<number[]>([]);
  const [circuitToDeactivate, setCircuitToDeactivate] =
    useState<Circuit | null>(null);

  // Navigate to the circuit statuses page when clicking on a circuit
  const handleCircuitClick = (circuitId: number) => {
    navigate(`/circuits/${circuitId}/statuses`);
  };

  const [circuitToActivate, setCircuitToActivate] = useState<Circuit | null>(
    null
  );

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCircuits,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: circuits,
    initialPageSize: 25,
  });

  // Update handleSelectAll to work with current page data only
  const handleSelectAll = () => {
    const currentPageCircuitIds = paginatedCircuits.map(
      (circuit) => circuit.id
    );
    const allCurrentPageSelected = currentPageCircuitIds.every((id) =>
      selectedCircuits.includes(id)
    );

    if (allCurrentPageSelected) {
      // Deselect all on current page
      const newSelected = selectedCircuits.filter(
        (id) => !currentPageCircuitIds.includes(id)
      );
      paginatedCircuits.forEach((circuit) => onSelectCircuit(circuit.id));
    } else {
      // Select all on current page
      currentPageCircuitIds.forEach((id) => {
        if (!selectedCircuits.includes(id)) {
          onSelectCircuit(id);
        }
      });
    }
    onSelectAll();
  };

  const handleToggleActive = async (circuit: Circuit, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent multiple clicks
    if (loadingCircuits.includes(circuit.id)) return;

    // For activation, show the activation dialog
    if (!circuit.isActive) {
      setCircuitToActivate(circuit);
      return;
    }

    // For deactivation, check if circuit has documents first
    setLoadingCircuits((prev) => [...prev, circuit.id]);

    try {
      // Check if circuit is used by any documents
      const usageInfo = await circuitService.checkCircuitUsage(circuit.id);

      if (usageInfo.isUsed) {
        // If circuit has documents, show error and don't allow deactivation
        toast.error(
          `Cannot deactivate circuit: It is currently assigned to ${
            usageInfo.documentCount > 1 ? "documents" : "a document"
          }.`
        );
        setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
        return;
      }

      // Show confirmation dialog
      setCircuitToDeactivate(circuit);
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    } catch (error: any) {
      const errorMessage =
        error?.message || "An error occurred while checking circuit usage";
      toast.error(errorMessage);
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  const performToggle = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);

    try {
      // Toggle activation
      await circuitService.toggleCircuitActivation(circuit);
      toast.success(
        `Circuit ${circuit.isActive ? "deactivated" : "activated"} successfully`
      );

      // Refresh the list
      if (refetch) {
        await refetch();
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "An error occurred while updating the circuit";
      toast.error(errorMessage);
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
      setCircuitToDeactivate(null);
    }
  };

  // Calculate selectedCount for current page
  const selectedCount = paginatedCircuits.filter((circuit) =>
    selectedCircuits.includes(circuit.id)
  ).length;

  return (
    <div className="space-y-4">
      {/* Circuit Activation Dialog */}
      <CircuitActivationDialog
        isOpen={circuitToActivate !== null}
        onClose={() => setCircuitToActivate(null)}
        circuit={circuitToActivate as Circuit}
        onActivate={() => {
          if (circuitToActivate) {
            performToggle(circuitToActivate);
            setCircuitToActivate(null);
          }
        }}
      />

      {/* Table Container */}
      <>
        {/* Fixed Header - Never Scrolls */}
        <div className="min-w-[1200px] border-b border-blue-900/30">
          <Table className="table-fixed w-full">
            <CircuitTableHeader
              isSimpleUser={isSimpleUser}
              selectedCount={selectedCount}
              totalCount={paginatedCircuits.length}
              onSelectAll={handleSelectAll}
              sortConfig={sortConfig}
              onSort={onSort}
            />
          </Table>
        </div>

        {/* Scrollable Body - Only Content Scrolls */}
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
          <div className="min-w-[1200px]">
            <Table className="table-fixed w-full">
              <TableBody>
                {paginatedCircuits.map((circuit) => (
                  <CircuitTableRow
                    key={circuit.id}
                    circuit={circuit}
                    isSimpleUser={isSimpleUser}
                    isSelected={selectedCircuits.includes(circuit.id)}
                    onSelectCircuit={onSelectCircuit}
                    onCircuitClick={handleCircuitClick}
                    loadingCircuits={loadingCircuits}
                    onToggleActive={handleToggleActive}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                    refetch={refetch}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </>

      {/* Smart Pagination */}
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Deactivation confirmation dialog */}
      <AlertDialog
        open={circuitToDeactivate !== null}
        onOpenChange={(open) => !open && setCircuitToDeactivate(null)}
      >
        <AlertDialogContent className="bg-[#0a1033] border-blue-900/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Circuit</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to deactivate this circuit? This will
              prevent new documents from being assigned to it.
              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-900/30 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">
                  Verification complete: This circuit is not currently assigned
                  to any documents.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-900/50 text-gray-300 hover:bg-blue-900/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (circuitToDeactivate) {
                  performToggle(circuitToDeactivate);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loadingCircuits.includes(circuitToDeactivate?.id || 0)
                ? "Deactivating..."
                : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
