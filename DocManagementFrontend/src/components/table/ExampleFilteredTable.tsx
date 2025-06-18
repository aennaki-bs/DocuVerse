
import { useState } from 'react';
import { 
  useTableFilters, 
  TableSearchBar, 
  TableAdvancedFilters, 
  TableActiveFilters,
  DEFAULT_STATUS_FILTERS,
  DEFAULT_TYPE_FILTERS
} from '@/components/table';

// Example component showing how to use the table filter system
export function ExampleFilteredTable() {
  // Define searchable fields for this table
  const searchFields = [
    { id: 'all', label: 'All fields' },
    { id: 'name', label: 'Name' },
    { id: 'code', label: 'Code' },
    { id: 'category', label: 'Category' }
  ];
  
  // Initialize the filter hook
  const {
    filters,
    setSearchQuery,
    setSearchField,
    setStatusFilter,
    setTypeFilter,
    setDateRange,
    resetFilters,
    isAdvancedFiltersOpen,
    setIsAdvancedFiltersOpen,
    filterItem
  } = useTableFilters({
    searchableFields: searchFields, 
    defaultSearchField: 'all',
    includeStatusFilter: true,
    includeTypeFilter: true,
    includeDateFilter: true
  });
  
  // Example data
  const items = [
    { id: 1, name: 'Item One', code: 'ITM001', category: 'Category A', status: 0 },
    { id: 2, name: 'Item Two', code: 'ITM002', category: 'Category B', status: 1 },
    { id: 3, name: 'Item Three', code: 'ITM003', category: 'Category A', status: 2 }
  ];
  
  // Apply filters to items
  const filteredItems = items.filter(item => filterItem(item));
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Filtered Table Example</h2>
      
      {/* Search bar */}
      <TableSearchBar
        searchQuery={filters.searchQuery}
        onSearchChange={setSearchQuery}
        searchField={filters.searchField}
        onSearchFieldChange={setSearchField}
        searchFields={searchFields}
        dateRange={filters.dateRange}
        onDateRangeChange={setDateRange}
        onToggleAdvancedFilters={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
      />
      
      {/* Advanced filters panel */}
      {isAdvancedFiltersOpen && (
        <TableAdvancedFilters
          statusFilter={filters.statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={DEFAULT_STATUS_FILTERS}
          typeFilter={filters.typeFilter}
          setTypeFilter={setTypeFilter}
          typeOptions={DEFAULT_TYPE_FILTERS}
          dateRange={filters.dateRange}
          setDateRange={setDateRange}
          onClose={() => setIsAdvancedFiltersOpen(false)}
          onApply={() => setIsAdvancedFiltersOpen(false)}
          onClear={resetFilters}
        />
      )}
      
      {/* Active filters */}
      <TableActiveFilters
        dateRange={filters.dateRange}
        onClearDateRange={() => setDateRange(undefined)}
        statusFilter={filters.statusFilter}
        statusOptions={DEFAULT_STATUS_FILTERS}
        onClearStatus={() => setStatusFilter('any')}
        typeFilter={filters.typeFilter}
        typeOptions={DEFAULT_TYPE_FILTERS}
        onClearType={() => setTypeFilter('any')}
        onClearAll={resetFilters}
      />
      
      {/* Table example */}
      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Code</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.code}</td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">
                    {item.status === 0 && "Draft"}
                    {item.status === 1 && "In Progress"}
                    {item.status === 2 && "Completed"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No items match your filter criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
