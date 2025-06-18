import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
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
import { DocumentStatus } from "@/models/documentCircuit";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

export interface StatusTableProps {
  statuses: DocumentStatus[];
  onEdit: (status: DocumentStatus) => void;
  onDelete: (status: DocumentStatus) => void;
  onActivate?: (status: DocumentStatus) => void;
  onDeactivate?: (status: DocumentStatus) => void;
  className?: string;
  isCircuitActive?: boolean;
  selectedStatusIds?: number[];
  onSelectStatus?: (statusId: number, isSelected: boolean) => void;
  onSelectAll?: (isSelected: boolean) => void;
}

export function StatusTable({
  statuses,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  className,
  isCircuitActive,
  selectedStatusIds = [],
  onSelectStatus,
  onSelectAll,
}: StatusTableProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedStatuses,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: statuses,
    initialPageSize: 25,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        {statuses.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-blue-300">
              <p className="text-sm">No statuses found</p>
            </div>
          </div>
        ) : (
          <>
            {/* Fixed Header - Never Scrolls */}
            <div className="min-w-[800px] border-b border-blue-900/30">
              <Table className={cn("table-fixed w-full", className)}>
                <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
                  <TableRow className="hover:bg-transparent border-blue-900/30">
                    {onSelectStatus && onSelectAll && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            paginatedStatuses.length > 0 &&
                            selectedStatusIds.filter((id) =>
                              paginatedStatuses.some((s) => s.statusId === id)
                            ).length === paginatedStatuses.length
                          }
                          onCheckedChange={(checked) => {
                            onSelectAll(!!checked);
                          }}
                          aria-label="Select all"
                          className="translate-y-[2px]"
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-[150px] text-blue-200 font-medium">
                      <div className="flex items-center">
                        Code
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px] text-blue-200 font-medium">
                      <div className="flex items-center">
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[300px] text-blue-200 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="w-[100px] text-right text-blue-200 font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
              <div className="min-w-[800px]">
                <Table className={cn("table-fixed w-full", className)}>
                  <TableBody>
                    {paginatedStatuses.map((status) => (
                      <TableRow
                        key={status.statusId}
                        className={cn(
                          "border-blue-900/20 hover:bg-blue-900/20",
                          selectedStatusIds.includes(status.statusId) &&
                            "bg-blue-900/30"
                        )}
                      >
                        {onSelectStatus && (
                          <TableCell>
                            <Checkbox
                              checked={selectedStatusIds.includes(
                                status.statusId
                              )}
                              onCheckedChange={(checked) => {
                                onSelectStatus(status.statusId, !!checked);
                              }}
                              aria-label={`Select status ${status.title}`}
                              className="translate-y-[2px]"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-xs text-blue-300">
                          {status.statusKey}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-blue-100">
                              {status.title}
                            </span>
                            {status.description && (
                              <span className="text-xs text-blue-400 line-clamp-1">
                                {status.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {status.isInitial && (
                              <Badge
                                variant="outline"
                                className="bg-blue-900/30 text-blue-400 border-blue-700/30"
                              >
                                Initial
                              </Badge>
                            )}
                            {status.isFinal && (
                              <Badge
                                variant="outline"
                                className="bg-purple-900/30 text-purple-400 border-purple-700/30"
                              >
                                Final
                              </Badge>
                            )}
                            {status.isFlexible && (
                              <Badge
                                variant="outline"
                                className="bg-amber-900/30 text-amber-400 border-amber-700/30"
                              >
                                Flexible
                              </Badge>
                            )}
                            {!status.isInitial &&
                              !status.isFinal &&
                              !status.isFlexible && (
                                <Badge
                                  variant="outline"
                                  className="text-gray-400 border-gray-700"
                                >
                                  Normal
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isCircuitActive ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 cursor-not-allowed opacity-50"
                                      disabled
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cannot edit status in active circuit</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-900/20 hover:text-blue-300"
                                onClick={() => onEdit(status)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}

                            {isCircuitActive ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 cursor-not-allowed opacity-50"
                                      disabled
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Cannot delete status in active circuit
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-900/20 hover:text-red-400"
                                onClick={() => onDelete(status)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* Smart Pagination */}
      {statuses.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
