
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { FilterOption } from './TableAdvancedFilters';

interface TableActiveFiltersProps {
  dateRange?: DateRange | undefined;
  onClearDateRange?: () => void;
  
  statusFilter?: string;
  statusOptions?: FilterOption[];
  onClearStatus?: () => void;
  
  typeFilter?: string;
  typeOptions?: FilterOption[];
  onClearType?: () => void;
  
  customFilters?: Record<string, any>;
  customFilterOptions?: Record<string, FilterOption[]>;
  onClearCustomFilter?: (filterName: string) => void;
  
  onClearAll?: () => void;
  
  className?: string;
}

export function TableActiveFilters({
  dateRange,
  onClearDateRange,
  
  statusFilter,
  statusOptions,
  onClearStatus,
  
  typeFilter,
  typeOptions,
  onClearType,
  
  customFilters,
  customFilterOptions,
  onClearCustomFilter,
  
  onClearAll,
  
  className = ""
}: TableActiveFiltersProps) {
  // Count active filters
  const hasDateFilter = dateRange && dateRange.from;
  const hasStatusFilter = statusFilter && statusFilter !== 'any';
  const hasTypeFilter = typeFilter && typeFilter !== 'any';
  
  let customFilterCount = 0;
  if (customFilters && customFilterOptions) {
    customFilterCount = Object.entries(customFilters)
      .filter(([key, value]) => value !== 'any' && value !== undefined && value !== null)
      .length;
  }
  
  const totalActiveFilters = 
    (hasDateFilter ? 1 : 0) + 
    (hasStatusFilter ? 1 : 0) + 
    (hasTypeFilter ? 1 : 0) + 
    customFilterCount;
  
  if (totalActiveFilters === 0) return null;
  
  const getStatusLabel = (value: string) => {
    return statusOptions?.find(opt => opt.value === value)?.label || value;
  };
  
  const getTypeLabel = (value: string) => {
    return typeOptions?.find(opt => opt.value === value)?.label || value;
  };
  
  const getCustomFilterLabel = (filterName: string, value: string) => {
    return customFilterOptions?.[filterName]?.find(opt => opt.value === value)?.label || value;
  };
  
  return (
    <div className={`flex flex-wrap items-center gap-2 mt-2 ${className}`}>
      <div className="text-sm text-muted-foreground mr-1">Active filters:</div>
      
      {/* Date range badge */}
      {hasDateFilter && onClearDateRange && (
        <Badge variant="secondary" className="flex gap-1 items-center">
          <Calendar className="h-3 w-3" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
              </>
            ) : (
              format(dateRange.from, "MMM d, yyyy")
            )
          ) : (
            <span>Date Range</span>
          )}
          <button
            onClick={onClearDateRange}
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {/* Status filter badge */}
      {hasStatusFilter && onClearStatus && (
        <Badge variant="secondary" className="flex gap-1 items-center">
          Status: {getStatusLabel(statusFilter!)}
          <button
            onClick={onClearStatus}
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {/* Type filter badge */}
      {hasTypeFilter && onClearType && (
        <Badge variant="secondary" className="flex gap-1 items-center">
          Type: {getTypeLabel(typeFilter!)}
          <button
            onClick={onClearType}
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {/* Custom filters badges */}
      {customFilters && customFilterOptions && onClearCustomFilter && 
        Object.entries(customFilters)
          .filter(([key, value]) => value !== 'any' && value !== undefined && value !== null)
          .map(([filterName, value]) => (
            <Badge key={filterName} variant="secondary" className="flex gap-1 items-center">
              {formatFilterName(filterName)}: {getCustomFilterLabel(filterName, value)}
              <button
                onClick={() => onClearCustomFilter(filterName)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
      }
      
      {/* Clear all button */}
      {totalActiveFilters > 1 && onClearAll && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
          className="h-7 px-2 text-xs"
        >
          Clear all
        </Button>
      )}
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
