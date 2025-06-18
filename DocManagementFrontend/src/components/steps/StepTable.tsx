import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StepTableHeader } from "./table/StepTableHeader";
import { StepTableRow } from "./table/StepTableRow";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Step } from "@/models/step";

// Define interfaces not available globally
interface Circuit {
  id: number;
  title: string;
  circuitKey: string;
  isActive: boolean;
}

interface StepFilterOptions {
  circuit?: number;
  responsibleRole?: number;
  isFinalStep?: boolean;
}

interface StepTableProps {
  steps: Step[];
  selectedSteps: number[];
  onSelectStep: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete?: (step: Step) => void;
  onEdit?: (step: Step) => void;
  circuits?: Circuit[];
  onSort?: (field: string) => void;
  sortField?: string | null;
  sortDirection?: "asc" | "desc";
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterOptions?: StepFilterOptions;
  setFilterOptions?: (options: StepFilterOptions) => void;
  resetFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onReorderSteps?: (dragIndex: number, hoverIndex: number) => void;
  className?: string;
}

export function StepTable({
  steps,
  selectedSteps,
  onSelectStep,
  onSelectAll,
  onDelete,
  onEdit,
  circuits = [],
  onSort,
  sortField = null,
  sortDirection = "asc",
  searchQuery = "",
  onSearchChange,
  filterOptions = {},
  setFilterOptions,
  resetFilters,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onReorderSteps,
  className,
}: StepTableProps) {
  // Use pagination hook
  const {
    currentPage: paginationPage,
    pageSize,
    totalPages: paginationTotalPages,
    totalItems,
    paginatedData: paginatedSteps,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: steps,
    initialPageSize: 25,
  });

  // Check if all eligible steps are selected (using paginated data)
  const areAllEligibleSelected =
    paginatedSteps.length > 0 &&
    paginatedSteps.length ===
      selectedSteps.filter((id) =>
        paginatedSteps.some((step) => step.id === id)
      ).length;
  const hasEligibleSteps = paginatedSteps.length > 0;

  // Create circuit info map with title, key, and active status
  const circuitInfoMap = circuits.reduce((map, circuit) => {
    map[circuit.id] = {
      title: circuit.title,
      key: circuit.circuitKey,
      isActive: circuit.isActive,
    };
    return map;
  }, {} as Record<number, { title: string; key: string; isActive: boolean }>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("w-full space-y-4", className)}>
        <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
          {steps.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center text-blue-300">
                <p className="text-sm">No steps found</p>
              </div>
            </div>
          ) : (
            <>
              {/* Fixed Header - Never Scrolls */}
              <div className="min-w-[1000px] border-b border-blue-900/30">
                <Table className="table-fixed w-full">
                  <StepTableHeader
                    onSelectAll={onSelectAll}
                    areAllEligibleSelected={areAllEligibleSelected}
                    hasEligibleSteps={hasEligibleSteps}
                    onSort={onSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </Table>
              </div>

              {/* Scrollable Body - Only Content Scrolls */}
              <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
                <div className="min-w-[1000px]">
                  <Table className="table-fixed w-full">
                    <TableBody>
                      {paginatedSteps.map((step, index) => {
                        const circuitInfo = circuitInfoMap[step.circuitId] || {
                          title: `Circuit #${step.circuitId}`,
                          key: "",
                          isActive: false,
                        };
                        return (
                          <StepTableRow
                            key={step.id}
                            step={step}
                            isSelected={selectedSteps.includes(step.id)}
                            onSelectStep={onSelectStep}
                            onDeleteStep={onDelete}
                            onEditStep={onEdit}
                            circuitName={circuitInfo.title}
                            circuitKey={circuitInfo.key}
                            isCircuitActive={circuitInfo.isActive}
                            index={index}
                            onReorder={onReorderSteps}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Smart Pagination */}
        {steps.length > 0 && (
          <SmartPagination
            currentPage={paginationPage}
            totalPages={paginationTotalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </DndProvider>
  );
}
