
import { useState } from 'react';
import { DateRange } from "react-day-picker";

interface AdvancedFiltersState {
  statusFilter: string;
  typeFilter: string;
  dateRange: DateRange | undefined;
}

interface UseAdvancedFiltersReturn {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  isFiltersApplied: boolean;
}

export function useAdvancedFilters(
  onApplyFilters: (filters: AdvancedFiltersState) => void
): UseAdvancedFiltersReturn {
  // Current state of filters being edited
  const [statusFilter, setStatusFilter] = useState("any");
  const [typeFilter, setTypeFilter] = useState("any");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Track if filters have been applied
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  const resetFilters = () => {
    setStatusFilter("any");
    setTypeFilter("any");
    setDateRange(undefined);
    setIsFiltersApplied(false);
    onApplyFilters({ statusFilter: "any", typeFilter: "any", dateRange: undefined });
  };

  const applyFilters = () => {
    setIsFiltersApplied(
      statusFilter !== "any" || typeFilter !== "any" || dateRange !== undefined
    );
    onApplyFilters({ statusFilter, typeFilter, dateRange });
  };

  return {
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    resetFilters,
    applyFilters,
    isFiltersApplied
  };
}
