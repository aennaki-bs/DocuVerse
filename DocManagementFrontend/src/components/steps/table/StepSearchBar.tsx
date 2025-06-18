
import { 
  TableSearchBar, 
  DEFAULT_STEP_SEARCH_FIELDS
} from '@/components/table';

interface StepSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchField?: string;
  onFieldChange?: (field: string) => void;
}

export const StepSearchBar = ({
  searchQuery,
  onSearchChange,
  searchField = "all",
  onFieldChange
}: StepSearchBarProps) => {
  return (
    <TableSearchBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchField={searchField}
      onSearchFieldChange={onFieldChange || (() => {})}
      searchFields={DEFAULT_STEP_SEARCH_FIELDS}
      placeholderText="Search steps..."
      className="mb-4"
    />
  );
};
