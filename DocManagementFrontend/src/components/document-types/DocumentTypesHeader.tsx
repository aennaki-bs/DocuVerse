import {
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
  Filter,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchAndFilterBar } from "@/components/shared/SearchAndFilterBar";

interface DocumentTypesHeaderProps {
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
  onNewTypeClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const DocumentTypesHeader = ({
  viewMode,
  onViewModeChange,
  onNewTypeClick,
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
}: DocumentTypesHeaderProps) => {
  const handleViewModeChange = (value: string) => {
    if (value === "table" || value === "grid") {
      onViewModeChange(value);
    }
  };

  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "name", label: "Type Name" },
    { id: "key", label: "Type Code" },
    { id: "attr", label: "Attributes" },
  ];

  return (
    <>
      <PageHeader
        title="Document Types"
        description="Manage document classification system"
        icon={<Layers className="h-6 w-6 text-blue-400" />}
        actions={
          <>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={onNewTypeClick}
            >
              <Plus className="h-4 w-4" />
              New Type
            </Button>
          </>
        }
      />

      <div className=" pt-2 pb-2">
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search document types..."
          filterOpen={showFilters}
          onFilterOpenChange={onToggleFilters}
          additionalControls={
            <div className="flex gap-2">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={handleViewModeChange}
                className="border border-blue-900/40 rounded-md bg-[#22306e]"
              >
                <ToggleGroupItem
                  value="table"
                  aria-label="Table view"
                  className="data-[state=on]:bg-blue-600 data-[state=on]:text-white text-blue-300 hover:text-blue-100 hover:bg-blue-900/50"
                >
                  <LayoutList className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="data-[state=on]:bg-blue-600 data-[state=on]:text-white text-blue-300 hover:text-blue-100 hover:bg-blue-900/50"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          }
        />
      </div>
    </>
  );
};

export default DocumentTypesHeader;
