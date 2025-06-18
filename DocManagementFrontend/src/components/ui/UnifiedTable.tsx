import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

// Types
export interface UnifiedColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface SearchField {
  id: string;
  label: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export interface FilterBadge {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedItems: any[]) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

export interface UnifiedTableProps<T> {
  // Core data
  data: T[];
  columns: UnifiedColumn<T>[];
  keyField: keyof T;

  // Header
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  showHeader?: boolean;

  // Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchFields?: SearchField[];
  selectedSearchField?: string;
  onSearchFieldChange?: (field: string) => void;
  searchPlaceholder?: string;

  // Filters
  filterOptions?: FilterOption[];
  filterBadges?: FilterBadge[];
  additionalControls?: React.ReactNode;

  // Selection & Bulk Actions
  selectedItems?: any[];
  onSelectItems?: (items: any[]) => void;
  bulkActions?: BulkAction[];

  // Row Actions (3-dots menu)
  rowActions?: RowAction<T>[];

  // Sorting
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;

  // States
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;

  // Pagination
  initialPageSize?: number;
  pageSizeOptions?: number[];

  // Styling
  className?: string;
  containerClassName?: string;
}

export function UnifiedTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  title,
  subtitle,
  headerAction,
  showHeader = true,
  searchQuery = "",
  onSearchChange,
  searchFields = [],
  selectedSearchField = "all",
  onSearchFieldChange,
  searchPlaceholder = "Search...",
  filterOptions = [],
  filterBadges = [],
  additionalControls,
  selectedItems = [],
  onSelectItems,
  bulkActions = [],
  rowActions = [],
  sortBy,
  sortDirection,
  onSort,
  isLoading = false,
  isError = false,
  errorMessage = "Failed to load data. Please try again.",
  emptyMessage = "No data found.",
  initialPageSize = 15,
  pageSizeOptions = [10, 15, 25, 50],
  className,
  containerClassName,
}: UnifiedTableProps<T>) {
  // Local state
  const [filterOpen, setFilterOpen] = useState(false);

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: data || [],
    initialPageSize,
  });

  // Selection logic
  const isAllSelected = useMemo(() => {
    if (!onSelectItems || paginatedData.length === 0) return false;
    return paginatedData.every((item) =>
      selectedItems.includes(item[keyField])
    );
  }, [selectedItems, paginatedData, keyField, onSelectItems]);

  const isIndeterminate = useMemo(() => {
    if (!onSelectItems || selectedItems.length === 0) return false;
    const currentPageItems = paginatedData.map((item) => item[keyField]);
    const selectedFromCurrentPage = selectedItems.filter((id) =>
      currentPageItems.includes(id)
    );
    return (
      selectedFromCurrentPage.length > 0 &&
      selectedFromCurrentPage.length < currentPageItems.length
    );
  }, [selectedItems, paginatedData, keyField, onSelectItems]);

  // Handlers
  const handleSelectAll = () => {
    if (!onSelectItems) return;
    const currentPageIds = paginatedData.map((item) => item[keyField]);
    if (isAllSelected) {
      onSelectItems(selectedItems.filter((id) => !currentPageIds.includes(id)));
    } else {
      onSelectItems([...new Set([...selectedItems, ...currentPageIds])]);
    }
  };

  const handleSelectItem = (itemId: any) => {
    if (!onSelectItems) return;
    if (selectedItems.includes(itemId)) {
      onSelectItems(selectedItems.filter((id) => id !== itemId));
    } else {
      onSelectItems([...selectedItems, itemId]);
    }
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    if (sortBy === columnKey) {
      onSort(sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnKey);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey)
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-blue-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-400" />
    );
  };

  const clearAllFilters = () => {
    filterOptions.forEach((filter) => filter.onChange("any"));
    if (onSearchChange) onSearchChange("");
    setFilterOpen(false);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filterOptions.some((filter) => filter.value !== "any") ||
      searchQuery.length > 0
    );
  }, [filterOptions, searchQuery]);

  // Render functions
  const renderHeader = () => (
    <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl border border-primary/10 shadow-lg">
      {/* Title Section */}
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h1 className="text-xl font-semibold text-foreground mb-1">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
        {/* Search Section */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {searchFields.length > 0 && onSearchFieldChange && (
            <Select
              value={selectedSearchField}
              onValueChange={onSearchFieldChange}
            >
              <SelectTrigger className="w-[140px] bg-background/80 border-primary/20">
                <SelectValue placeholder="Search in" />
              </SelectTrigger>
              <SelectContent>
                {searchFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="relative flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-background/80 border-primary/20 pl-10 pr-8"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter and Additional Controls */}
        <div className="flex items-center gap-2">
          {filterOptions.length > 0 && (
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-background/80 border-primary/20"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {filterOptions.filter((f) => f.value !== "any").length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {filterOptions.map((filter) => (
                      <div key={filter.id}>
                        <label className="block text-sm font-medium mb-1">
                          {filter.label}
                        </label>
                        <Select
                          value={filter.value}
                          onValueChange={filter.onChange}
                        >
                          <SelectTrigger className="bg-background/80 border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.options.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
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
          {additionalControls}
        </div>
      </div>

      {/* Filter Badges */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterBadges.map((badge) => (
            <Badge
              key={badge.id}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
            >
              {badge.icon}
              {badge.label}: {badge.value}
              <button
                onClick={badge.onRemove}
                className="ml-1 hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() =>
                  action.onClick(
                    selectedItems
                      .map((id) => data.find((item) => item[keyField] === id))
                      .filter(Boolean)
                  )
                }
                className={action.className}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive">{errorMessage}</p>
          </div>
        </div>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{emptyMessage}</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      );
    }

    const minTableWidth = columns.length * 150; // Minimum width calculation

    return (
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-primary/5">
          <div style={{ minWidth: `${minTableWidth}px` }}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-primary/10">
                  {onSelectItems && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el && "indeterminate" in el) {
                            (el as any).indeterminate = isIndeterminate;
                          }
                        }}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.key)}
                      className={cn(
                        "font-medium text-foreground",
                        column.width && `w-[${column.width}]`,
                        column.sortable && "cursor-pointer select-none",
                        column.className
                      )}
                      onClick={() =>
                        column.sortable && handleSort(String(column.key))
                      }
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && getSortIcon(String(column.key))}
                      </div>
                    </TableHead>
                  ))}
                  {rowActions.length > 0 && (
                    <TableHead className="w-12"></TableHead>
                  )}
                </TableRow>
              </TableHeader>
            </Table>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-hidden"
          style={{ maxHeight: "calc(100vh - 400px)" }}
        >
          <ScrollArea className="h-full w-full">
            <div style={{ minWidth: `${minTableWidth}px` }} className="pb-4">
              <Table>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow
                      key={String(item[keyField])}
                      className="border-b-primary/10"
                    >
                      {onSelectItems && (
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedItems.includes(item[keyField])}
                            onCheckedChange={() =>
                              handleSelectItem(item[keyField])
                            }
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={String(column.key)}
                          className={cn(
                            column.width && `w-[${column.width}]`,
                            column.className
                          )}
                        >
                          {column.render
                            ? column.render(item)
                            : String(item[column.key] ?? "")}
                        </TableCell>
                      ))}
                      {rowActions.length > 0 && (
                        <TableCell className="w-12">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-background/95 backdrop-blur-xl border-primary/20"
                            >
                              {rowActions.map((action, index) => (
                                <React.Fragment key={action.id}>
                                  <DropdownMenuItem
                                    onClick={() => action.onClick(item)}
                                    className={cn(
                                      "flex items-center gap-2",
                                      action.variant === "destructive" &&
                                        "text-destructive focus:text-destructive"
                                    )}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </DropdownMenuItem>
                                  {action.separator &&
                                    index < rowActions.length - 1 && (
                                      <DropdownMenuSeparator />
                                    )}
                                </React.Fragment>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", containerClassName)}>
      {showHeader && renderHeader()}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg",
          className
        )}
      >
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        <div className="relative z-10 h-full">{renderTable()}</div>
      </div>

      {/* Pagination */}
      {!isLoading && !isError && data.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
