import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchField {
  id: string;
  label: string;
}

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchFields?: SearchField[];
  selectedSearchField?: string;
  onSearchFieldChange?: (value: string) => void;
  placeholder?: string;
  filterOpen?: boolean;
  onFilterOpenChange?: (open: boolean) => void;
  filterContent?: ReactNode;
  additionalControls?: ReactNode;
  className?: string;
}

export function SearchAndFilterBar({
  searchQuery,
  onSearchChange,
  searchFields,
  selectedSearchField,
  onSearchFieldChange,
  placeholder = "Search...",
  filterOpen,
  onFilterOpenChange,
  filterContent,
  additionalControls,
  className = "",
}: SearchAndFilterBarProps) {
  return (
    <div
      className={`w-full flex flex-col md:flex-row items-center gap-2 p-4 mb-4 rounded-xl bg-[#1e2a4a] shadow-lg border border-blue-900/40 ${className}`}
    >
      {/* Search field */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {searchFields && searchFields.length > 0 && onSearchFieldChange && (
          <Select
            value={selectedSearchField}
            onValueChange={onSearchFieldChange}
          >
            <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue placeholder="Search in" />
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {searchFields.map((field) => (
                <SelectItem
                  key={field.id}
                  value={field.id}
                  className="hover:bg-blue-800/40"
                >
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter popover */}
      {filterContent && onFilterOpenChange && (
        <Popover open={filterOpen} onOpenChange={onFilterOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2 ml-2"
            >
              <Filter className="h-4 w-4 text-blue-400" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
            {filterContent}
          </PopoverContent>
        </Popover>
      )}

      {/* Additional controls */}
      {additionalControls}
    </div>
  );
}
