import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Search,
  X,
  Trash2,
  Settings,
  LayoutList,
  LayoutGrid,
  Check,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell: (item: T) => React.ReactNode;
  enableSorting?: boolean;
  isAction?: boolean;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  onClick: (selectedItems: any[]) => void;
}

export interface FilterOption {
  id: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: string) => void;
}

export interface SearchField {
  id: string;
  label: string;
}

interface UnifiedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  bulkActions?: BulkAction[];
  filterOptions?: FilterOption[];
  searchFields?: SearchField[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchFieldValue?: string;
  onSearchFieldChange?: (field: string) => void;
  showViewToggle?: boolean;
  viewMode?: "list" | "card";
  onViewModeChange?: (mode: "list" | "card") => void;
  selectedItems?: any[];
  onSelectItems?: (items: any[]) => void;
  emptyState?: React.ReactNode;
  headerAction?: React.ReactNode;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string, direction: "asc" | "desc") => void;
}

export function UnifiedTable<T>({
  data,
  columns,
  keyField,
  title,
  subtitle,
  isLoading = false,
  bulkActions = [],
  filterOptions = [],
  searchFields = [],
  searchQuery = "",
  onSearchChange,
  searchFieldValue,
  onSearchFieldChange,
  showViewToggle = false,
  viewMode = "list",
  onViewModeChange,
  selectedItems = [],
  onSelectItems,
  emptyState,
  headerAction,
  sortBy,
  sortDirection,
  onSort,
}: UnifiedTableProps<T>) {
  const [filterOpen, setFilterOpen] = useState(false);

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: data,
    initialPageSize: 25,
  });

  // Handle selecting all items (for current page only)
  const handleSelectAll = () => {
    const currentPageKeys = paginatedData.map((item) => item[keyField]);
    const allCurrentPageSelected = currentPageKeys.every((key) =>
      selectedItems.includes(key)
    );

    if (allCurrentPageSelected) {
      // Deselect all on current page
      const newSelected = selectedItems.filter(
        (key) => !currentPageKeys.includes(key)
      );
      onSelectItems?.(newSelected);
    } else {
      // Select all on current page
      const newSelected = [...selectedItems];
      currentPageKeys.forEach((key) => {
        if (!selectedItems.includes(key)) {
          newSelected.push(key);
        }
      });
      onSelectItems?.(newSelected);
    }
  };

  // Handle selecting an individual item
  const handleSelectItem = (item: T) => {
    const itemKey = item[keyField];
    if (selectedItems.includes(itemKey)) {
      onSelectItems?.(selectedItems.filter((key) => key !== itemKey));
    } else {
      onSelectItems?.([...selectedItems, itemKey]);
    }
  };

  // Handle sorting
  const handleSortChange = (columnId: string) => {
    if (!onSort) return;

    if (sortBy === columnId) {
      onSort(columnId, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnId, "asc");
    }
  };

  // Get sort icon
  const getSortIcon = (columnId: string) => {
    if (sortBy !== columnId) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    filterOptions.forEach((option) => {
      option.onChange("any");
    });
    onSearchChange?.("");
    setFilterOpen(false);
  };

  // Calculate selectedCount for current page
  const selectedCount = paginatedData.filter((item) =>
    selectedItems.includes(item[keyField])
  ).length;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b border-blue-900/30 flex justify-between items-center">
          <div>
            <div className="h-6 w-48 bg-blue-800/50 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-blue-800/40 rounded-md animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="h-5 w-5 bg-blue-800/50 rounded-md mr-3 animate-pulse"></div>
                <div className="h-12 bg-blue-800/40 rounded-md w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  const isEmpty = data.length === 0;
  if (isEmpty && emptyState) {
    return (
      <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b border-blue-900/30 flex justify-between items-center">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-blue-100">{title}</h2>
            )}
            {subtitle && <p className="text-sm text-blue-300">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
        <div className="p-8">{emptyState}</div>
      </div>
    );
  }

  // Separate action columns from regular columns
  const regularColumns = columns.filter((col) => !col.isAction);
  const actionColumn = columns.find((col) => col.isAction);

  // Build card view
  const renderCardView = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedData.map((item, index) => {
          const itemKey = item[keyField];
          const isSelected = selectedItems.includes(itemKey);

          return (
            <motion.div
              key={String(itemKey)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "bg-gradient-to-b from-[#1f3373]/90 to-[#0c1442]/90 backdrop-blur-sm rounded-xl border relative overflow-hidden transition-all duration-300 group",
                isSelected
                  ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-[1.02]"
                  : "border-blue-800/50 hover:border-blue-700/60 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:scale-[1.01]"
              )}
            >
              {/* Action button in top-right corner */}
              {actionColumn && (
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {actionColumn.cell(item)}
                </div>
              )}

              <div className="p-6">
                {onSelectItems && (
                  <div className="mb-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectItem(item)}
                      className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500 transition-all duration-150"
                    />
                  </div>
                )}
                <div className="space-y-5">
                  {regularColumns.map((column) => (
                    <div key={column.id} className="space-y-2">
                      <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                        {column.header}
                      </div>
                      <div className="text-blue-100 leading-relaxed">
                        {column.cell(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination for card view */}
      <div className="mt-8 pt-4 border-t border-blue-900/30">
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );

  // Build table view with fixed header
  const renderTableView = () => (
    <div className="space-y-4">
      {/* Fixed Header - Never Scrolls */}
      <div className="min-w-[1200px] border-b border-blue-900/30">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
            <TableRow className="border-blue-900/30 hover:bg-transparent">
              {onSelectItems && (
                <TableHead className="w-[50px] text-blue-300 font-semibold py-4 px-4">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        selectedCount === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                    />
                  </div>
                </TableHead>
              )}
              {columns.map((column, index) => {
                // Advanced column width allocation based on content type
                let columnWidth = "w-auto";
                if (column.id === "name" || column.id === "groupName") {
                  columnWidth = "w-[220px]";
                } else if (
                  column.id === "ruleType" ||
                  column.id === "approvalRule"
                ) {
                  columnWidth = "w-[160px]";
                } else if (column.id === "comment") {
                  columnWidth = "w-[300px]";
                } else if (
                  column.id === "approversCount" ||
                  column.id === "approvers"
                ) {
                  columnWidth = "w-[120px]";
                } else if (column.id === "actions") {
                  columnWidth = "w-[100px]";
                }

                return (
                  <TableHead
                    key={column.id}
                    className={cn(
                      columnWidth,
                      "text-blue-300 font-semibold py-4 px-4 text-left",
                      column.enableSorting &&
                        onSort &&
                        "cursor-pointer hover:text-blue-100 transition-colors duration-150"
                    )}
                    onClick={() =>
                      column.enableSorting &&
                      onSort &&
                      handleSortChange(column.id)
                    }
                  >
                    <div className="flex items-center justify-start">
                      <span className="text-sm font-medium tracking-wide">
                        {column.header}
                      </span>
                      {column.enableSorting && onSort && (
                        <div className="ml-2">{getSortIcon(column.id)}</div>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body - Only Content Scrolls */}
      <ScrollArea className="h-[calc(100vh-420px)] min-h-[350px]">
        <div className="min-w-[1200px]">
          <Table className="table-fixed w-full">
            <TableBody>
              {paginatedData.map((item, rowIndex) => {
                const itemKey = item[keyField];
                const isSelected = selectedItems.includes(itemKey);

                return (
                  <TableRow
                    key={String(itemKey)}
                    className={cn(
                      "border-blue-900/30 transition-all duration-200 group",
                      isSelected
                        ? "bg-blue-900/40 border-l-4 border-l-blue-500 shadow-sm"
                        : "hover:bg-blue-900/20 hover:shadow-sm",
                      rowIndex % 2 === 0 ? "bg-blue-950/10" : "bg-transparent"
                    )}
                  >
                    {onSelectItems && (
                      <TableCell className="w-[50px] py-4 px-4">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectItem(item)}
                            className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500 transition-all duration-150"
                          />
                        </div>
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => {
                      // Apply same column widths as header
                      let columnWidth = "w-auto";
                      if (column.id === "name" || column.id === "groupName") {
                        columnWidth = "w-[220px]";
                      } else if (
                        column.id === "ruleType" ||
                        column.id === "approvalRule"
                      ) {
                        columnWidth = "w-[160px]";
                      } else if (column.id === "comment") {
                        columnWidth = "w-[300px]";
                      } else if (
                        column.id === "approversCount" ||
                        column.id === "approvers"
                      ) {
                        columnWidth = "w-[120px]";
                      } else if (column.id === "actions") {
                        columnWidth = "w-[100px]";
                      }

                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            columnWidth,
                            "py-4 px-4 text-blue-100 align-middle",
                            column.id === "actions"
                              ? "text-center"
                              : "text-left"
                          )}
                        >
                          <div
                            className={cn(
                              "transition-all duration-150",
                              column.id === "comment" &&
                                "truncate max-w-[280px]",
                              isSelected && "text-blue-50"
                            )}
                          >
                            {column.cell(item)}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Smart Pagination with enhanced spacing */}
      <div className="pt-2 pb-1">
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-xl">
      {/* Header with title and actions */}
      <div className="p-6 border-b border-blue-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#1a2c6b]/30 to-[#0a1033]/30">
        <div className="flex-1">
          {title && (
            <h2 className="text-2xl font-bold text-blue-100 tracking-wide">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-blue-300 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* View mode toggle - always show when showViewToggle is true */}
          {showViewToggle && onViewModeChange && (
            <div className="flex items-center bg-[#22306e]/80 rounded-lg border border-blue-900/40 shadow-md backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "rounded-r-none h-10 px-4 transition-all duration-200",
                  viewMode === "list"
                    ? "bg-blue-600/60 text-blue-100 hover:bg-blue-600/70 shadow-sm"
                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-800/50"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("card")}
                className={cn(
                  "rounded-l-none h-10 px-4 transition-all duration-200",
                  viewMode === "card"
                    ? "bg-blue-600/60 text-blue-100 hover:bg-blue-600/70 shadow-sm"
                    : "text-blue-400 hover:text-blue-300 hover:bg-blue-800/50"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {headerAction}
        </div>
      </div>

      {/* Search and filter toolbar */}
      {(searchFields.length > 0 ||
        filterOptions.length > 0 ||
        searchQuery !== "" ||
        onSearchChange) && (
        <div className="p-5 border-b border-blue-900/30 bg-blue-900/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 flex items-center gap-3 min-w-0">
              {searchFields.length > 0 && onSearchFieldChange && (
                <Select
                  value={searchFieldValue}
                  onValueChange={onSearchFieldChange}
                >
                  <SelectTrigger className="w-[140px] bg-[#22306e]/80 text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-blue-800/50 shadow-sm rounded-lg backdrop-blur-sm">
                    <SelectValue>
                      {searchFields.find(
                        (field) => field.id === searchFieldValue
                      )?.label || "All fields"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40 backdrop-blur-md">
                    {searchFields.map((field) => (
                      <SelectItem
                        key={field.id}
                        value={field.id}
                        className="hover:bg-blue-800/40 focus:bg-blue-800/40"
                      >
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {onSearchChange && (
                <div className="relative flex-1">
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="bg-[#22306e]/80 text-blue-100 border border-blue-900/40 pl-11 pr-10 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-blue-800/50 shadow-sm backdrop-blur-sm h-11"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange?.("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors duration-150"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Filter button */}
              {filterOptions.length > 0 && (
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#22306e]/80 text-blue-100 border border-blue-900/40 hover:bg-blue-800/50 shadow-sm rounded-lg flex items-center gap-2 h-11 px-4 backdrop-blur-sm transition-all duration-200"
                    >
                      <Filter className="h-4 w-4 text-blue-400" />
                      Filter
                      {filterOptions.some((opt) => opt.value !== "any") && (
                        <Badge className="ml-1 bg-blue-600 text-white shadow-sm">
                          {
                            filterOptions.filter((opt) => opt.value !== "any")
                              .length
                          }
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-[#22306e] text-blue-100 border border-blue-900/40 backdrop-blur-md shadow-xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-blue-100">Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 transition-all duration-150"
                        >
                          Clear All
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {filterOptions.map((filter) => (
                          <div key={filter.id} className="space-y-2">
                            <label className="text-sm font-medium text-blue-200">
                              {filter.label}
                            </label>
                            <Select
                              value={filter.value}
                              onValueChange={filter.onChange}
                            >
                              <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40 backdrop-blur-md">
                                {filter.options.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="hover:bg-blue-800/40 focus:bg-blue-800/40 transition-colors duration-150"
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Show active filters */}
          {filterOptions.some((opt) => opt.value !== "any") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filterOptions
                .filter((opt) => opt.value !== "any")
                .map((filter) => {
                  const option = filter.options.find(
                    (opt) => opt.value === filter.value
                  );
                  return (
                    <Badge
                      key={filter.id}
                      className="bg-blue-800/60 text-blue-200 hover:bg-blue-700 transition-all duration-200 px-3 py-2 shadow-sm backdrop-blur-sm"
                    >
                      {filter.label}: {option?.label}
                      <button
                        className="ml-2 hover:text-white transition-colors duration-150"
                        onClick={() => filter.onChange("any")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedItems.length > 0 && bulkActions.length > 0 && (
        <div className="px-6 py-3 bg-blue-800/30 border-b border-blue-900/30 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-blue-400" />
            <span className="text-blue-200 font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 && "s"}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => {
                  const selectedObjects = data.filter((item) =>
                    selectedItems.includes(item[keyField])
                  );
                  action.onClick(selectedObjects);
                }}
                className={cn(
                  "transition-all duration-200 shadow-sm",
                  action.variant === "destructive"
                    ? "bg-red-900/40 text-red-300 border-red-800/50 hover:bg-red-800/50 hover:shadow-md"
                    : "bg-blue-900/40 text-blue-300 border-blue-800/50 hover:bg-blue-800/50 hover:shadow-md"
                )}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "card" ? renderCardView() : renderTableView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
