
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { X } from "lucide-react";
import { FilterState } from "./hooks/useTableFilters";

// Generic filter option interface
export interface FilterOption {
  id: string | number;
  label: string;
  value: string;
}

interface TableAdvancedFiltersProps {
  statusFilter?: string;
  setStatusFilter?: (status: string) => void;
  statusOptions?: FilterOption[];
  
  typeFilter?: string;
  setTypeFilter?: (type: string) => void;
  typeOptions?: FilterOption[];
  
  dateRange?: FilterState['dateRange'];
  setDateRange?: (range: FilterState['dateRange']) => void;
  
  customFilters?: Record<string, any>;
  customFilterOptions?: Record<string, FilterOption[]>;
  updateCustomFilter?: (name: string, value: any) => void;
  
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  
  title?: string;
}

export function TableAdvancedFilters({
  statusFilter,
  setStatusFilter,
  statusOptions,
  
  typeFilter,
  setTypeFilter,
  typeOptions,
  
  dateRange,
  setDateRange,
  
  customFilters,
  customFilterOptions,
  updateCustomFilter,
  
  onClose,
  onApply,
  onClear,
  
  title = "Advanced Filters"
}: TableAdvancedFiltersProps) {
  // Count how many filter sections we have to determine grid columns
  const filterSectionCount = [
    statusOptions?.length, 
    typeOptions?.length, 
    !!setDateRange,
    Object.keys(customFilterOptions || {}).length
  ].filter(Boolean).length;
  
  const gridCols = filterSectionCount > 2 ? "md:grid-cols-3" : "md:grid-cols-2";
  
  return (
    <div className="bg-background border rounded-md p-4 mt-2 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {statusOptions && statusOptions.length > 0 && setStatusFilter && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {typeOptions && typeOptions.length > 0 && setTypeFilter && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {setDateRange && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date Range</label>
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full"
            />
          </div>
        )}
        
        {/* Custom filters */}
        {customFilterOptions && updateCustomFilter && Object.entries(customFilterOptions).map(([filterName, options]) => (
          <div key={filterName}>
            <label className="text-xs text-muted-foreground mb-1 block">{formatFilterName(filterName)}</label>
            <Select 
              value={customFilters?.[filterName] || 'any'} 
              onValueChange={value => updateCustomFilter(filterName, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${formatFilterName(filterName).toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClear}
        >
          Clear
        </Button>
        <Button 
          size="sm"
          onClick={onApply}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

// Helper function to format filter names for display
function formatFilterName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}
