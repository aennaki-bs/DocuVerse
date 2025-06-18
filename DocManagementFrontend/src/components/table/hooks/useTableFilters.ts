
import { useState, useCallback } from 'react';
import { DateRange } from 'react-day-picker';

export interface FilterState {
  searchQuery: string;
  searchField: string;
  statusFilter?: string;
  typeFilter?: string;
  dateRange?: DateRange;
  customFilters?: Record<string, any>;
}

export interface FilterOptions {
  searchableFields: { id: string; label: string }[];
  defaultSearchField?: string;
  includeStatusFilter?: boolean;
  includeTypeFilter?: boolean;
  includeDateFilter?: boolean;
  dateField?: string;
  customFilterOptions?: Record<string, any[]>;
}

export function useTableFilters(
  options: FilterOptions,
  onFilterChange?: (filters: FilterState) => void
) {
  // Initialize with default search field if provided
  const defaultSearchField = options.defaultSearchField || options.searchableFields[0]?.id || 'all';
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    searchField: defaultSearchField,
    statusFilter: 'any',
    typeFilter: 'any',
    dateRange: undefined,
    customFilters: {}
  });

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (onFilterChange) onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const setSearchQuery = useCallback((query: string) => {
    updateFilter('searchQuery', query);
  }, [updateFilter]);

  const setSearchField = useCallback((field: string) => {
    updateFilter('searchField', field);
  }, [updateFilter]);

  const setStatusFilter = useCallback((status: string) => {
    updateFilter('statusFilter', status);
  }, [updateFilter]);

  const setTypeFilter = useCallback((type: string) => {
    updateFilter('typeFilter', type);
  }, [updateFilter]);

  const setDateRange = useCallback((range: DateRange | undefined) => {
    updateFilter('dateRange', range);
  }, [updateFilter]);

  const updateCustomFilter = useCallback((filterName: string, value: any) => {
    setFilters(prev => {
      const newCustomFilters = { ...prev.customFilters, [filterName]: value };
      const newFilters = { ...prev, customFilters: newCustomFilters };
      if (onFilterChange) onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      searchField: defaultSearchField,
      statusFilter: 'any',
      typeFilter: 'any',
      dateRange: undefined,
      customFilters: {}
    });
    setIsFiltersApplied(false);
    if (onFilterChange) onFilterChange({
      searchQuery: '',
      searchField: defaultSearchField,
      statusFilter: 'any',
      typeFilter: 'any'
    });
  }, [defaultSearchField, onFilterChange]);

  const applyAdvancedFilters = useCallback(() => {
    setIsFiltersApplied(true);
    setIsAdvancedFiltersOpen(false);
    if (onFilterChange) onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Utility function to check if an item matches the current filters
  const filterItem = useCallback((item: any) => {
    // Search query filtering
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      const field = filters.searchField;
      
      if (field === 'all') {
        // Search across all searchable fields
        const matchesAnyField = options.searchableFields.some(searchField => {
          const fieldValue = getNestedValue(item, searchField.id);
          return fieldValue && String(fieldValue).toLowerCase().includes(query);
        });
        if (!matchesAnyField) return false;
      } else {
        // Search in specific field
        const fieldValue = getNestedValue(item, field);
        
        if (!fieldValue || !String(fieldValue).toLowerCase().includes(query)) {
          return false;
        }
      }
    }
    
    // Status filtering
    if (filters.statusFilter && filters.statusFilter !== 'any') {
      if (String(item.status) !== filters.statusFilter) {
        return false;
      }
    }
    
    // Type filtering
    if (filters.typeFilter && filters.typeFilter !== 'any') {
      const typeField = getTypeFieldValue(item);
      if (typeField !== filters.typeFilter) {
        return false;
      }
    }
    
    // Date range filtering
    if (filters.dateRange && filters.dateRange.from) {
      const dateField = options.dateField || 'createdAt';
      const itemDate = new Date(item[dateField]);
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate < fromDate || itemDate > toDate) {
          return false;
        }
      } else {
        if (itemDate < fromDate) {
          return false;
        }
      }
    }
    
    // Custom filters
    if (filters.customFilters) {
      for (const [key, value] of Object.entries(filters.customFilters)) {
        if (value === undefined || value === null || value === 'any') continue;
        
        const itemValue = getNestedValue(item, key);
          
        if (Array.isArray(value)) {
          // For multi-select filters
          if (value.length > 0 && !value.includes(itemValue)) {
            return false;
          }
        } else if (itemValue !== value) {
          return false;
        }
      }
    }
    
    return true;
  }, [filters, options.dateField, options.searchableFields]);
  
  // Helper function to safely get nested values from an object using dot notation
  function getNestedValue(obj: any, path: string): any {
    if (!obj) return null;
    return path.includes('.')
      ? path.split('.').reduce((nestedObj, key) => nestedObj && nestedObj[key] !== undefined ? nestedObj[key] : null, obj)
      : obj[path];
  }
  
  // Helper function to get type field value from various possible object structures
  function getTypeFieldValue(item: any): string | undefined {
    if (item.typeId) return String(item.typeId);
    if (item.type?.id) return String(item.type.id);
    if (item.documentType?.id) return String(item.documentType.id);
    return undefined;
  }

  return {
    filters,
    setSearchQuery,
    setSearchField,
    setStatusFilter,
    setTypeFilter,
    setDateRange,
    updateCustomFilter,
    resetFilters,
    isAdvancedFiltersOpen,
    setIsAdvancedFiltersOpen,
    isFiltersApplied,
    applyAdvancedFilters,
    filterItem
  };
}
