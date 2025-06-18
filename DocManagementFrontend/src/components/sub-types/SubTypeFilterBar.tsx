
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DocumentType } from '@/models/document';

interface SubTypeFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  documentTypes: DocumentType[];
  selectedDocTypeId: number | null;
  setSelectedDocTypeId: (id: number | null) => void;
  activeOnly: boolean;
  setActiveOnly: (active: boolean) => void;
}

const SubTypeFilterBar = ({
  searchQuery,
  setSearchQuery,
  documentTypes,
  selectedDocTypeId,
  setSelectedDocTypeId,
  activeOnly,
  setActiveOnly,
}: SubTypeFilterBarProps) => {
  const handleDocTypeChange = (value: string) => {
    setSelectedDocTypeId(value === 'all' ? null : parseInt(value));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDocTypeId(null);
    setActiveOnly(true);
  };

  return (
    <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
          <Input
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0a1033] border-blue-900/50 text-white"
          />
        </div>
        
        {/* Document type filter */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedDocTypeId ? String(selectedDocTypeId) : 'all'}
            onValueChange={handleDocTypeChange}
          >
            <SelectTrigger className="bg-[#0a1033] border-blue-900/50 text-white">
              <SelectValue placeholder="Filter by document type" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1033] border-blue-900/50 text-white">
              <SelectItem value="all">All Document Types</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.typeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Show active only toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="active-only"
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
          />
          <Label htmlFor="active-only" className="text-white">Active Only</Label>
        </div>
        
        {/* Clear filters button */}
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-400 hover:bg-blue-900/30"
          onClick={handleClearFilters}
        >
          <Filter className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default SubTypeFilterBar;
