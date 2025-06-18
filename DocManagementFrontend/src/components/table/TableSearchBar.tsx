
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { FilterState } from './hooks/useTableFilters';
import { useState, useEffect } from 'react';

interface SearchField {
  id: string;
  label: string;
}

interface TableSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchField: string;
  onSearchFieldChange: (field: string) => void;
  searchFields: SearchField[];
  showDatePicker?: boolean;
  dateRange?: FilterState['dateRange'];
  onDateRangeChange?: (range: FilterState['dateRange']) => void;
  onToggleAdvancedFilters?: () => void;
  placeholderText?: string;
  className?: string;
}

export const TableSearchBar = ({
  searchQuery,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  searchFields,
  showDatePicker = false,
  dateRange,
  onDateRangeChange,
  onToggleAdvancedFilters,
  placeholderText = "Search...",
  className = ""
}: TableSearchBarProps) => {
  const isDatePickerEnabled = searchField === 'date' || searchField === 'docDate' || showDatePicker;
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Sync local state with props
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearchQuery(newValue);
    onSearchChange(newValue);
  };
  
  const clearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
  };
  
  const selectedField = searchFields.find(f => f.id === searchField);
  const fieldLabel = selectedField?.label?.toLowerCase() || 'all fields';
  const placeholder = `Search by ${fieldLabel}...`;
  
  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={placeholder}
          value={localSearchQuery}
          onChange={handleSearchChange}
          className="pl-9 pr-8 w-full"
        />
        {localSearchQuery && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {searchFields.length > 0 && (
        <Select value={searchField} onValueChange={onSearchFieldChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All fields" />
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

      {onDateRangeChange && (
        <DateRangePicker
          date={dateRange}
          onDateChange={onDateRangeChange}
          className="w-auto"
          align="end"
          disabled={!isDatePickerEnabled}
        />
      )}
      
      {onToggleAdvancedFilters && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleAdvancedFilters}
          title="Advanced filters"
        >
          <FilterIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Lucide React Icon component
function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
