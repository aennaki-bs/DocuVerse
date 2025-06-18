import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentType } from "@/models/document";
import DocumentTypeTable from "@/components/document-types/DocumentTypeTable";
import DocumentTypeGrid from "@/components/document-types/DocumentTypeGrid";
import EmptyState from "@/components/document-types/EmptyState";
import LoadingState from "@/components/document-types/LoadingState";
import DocumentTypesPagination from "@/components/document-types/DocumentTypesPagination";

interface DocumentTypesContentProps {
  isLoading: boolean;
  types: DocumentType[];
  viewMode: "table" | "grid";
  selectedTypes: number[];
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  filteredAndSortedTypes: DocumentType[];
}

const DocumentTypesContent = ({
  isLoading,
  types,
  viewMode,
  selectedTypes,
  onDeleteType,
  onEditType,
  onSelectType,
  onSelectAll,
  searchQuery,
  setSearchQuery,
  sortField,
  sortDirection,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredAndSortedTypes,
}: DocumentTypesContentProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (types.length === 0) {
    return <EmptyState onAddType={() => {}} />;
  }

  return (
    <div className="flex-1 overflow-hidden">
      {viewMode === "table" ? (
        <div className="flex flex-col space-y-4">
          <DocumentTypeTable
            types={filteredAndSortedTypes}
            selectedTypes={selectedTypes}
            onSelectType={onSelectType}
            onSelectAll={onSelectAll}
            onDeleteType={onDeleteType}
            onEditType={onEditType}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {totalPages > 1 && (
            <div className="border-t border-blue-900/30 bg-[#0f1642]/50 p-2 rounded-b-lg">
              <DocumentTypesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <DocumentTypeGrid
            types={filteredAndSortedTypes}
            onDeleteType={onDeleteType}
            onEditType={onEditType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {totalPages > 1 && (
            <div className="border-t border-blue-900/30 bg-[#0f1642]/50 p-2 rounded-lg">
              <DocumentTypesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentTypesContent;
