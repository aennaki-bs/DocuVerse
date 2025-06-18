import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  FileText, 
  Check,
  ChevronDown,
  X
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import documentTypeService from "@/services/documents/documentTypeService";

interface CreateCircuitStepDocumentTypeProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function CreateCircuitStepDocumentType({
  value,
  onChange,
  disabled,
  onNext,
  onBack,
}: CreateCircuitStepDocumentTypeProps) {
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch document types
  const { data: documentTypes, isLoading } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => documentTypeService.getAllDocumentTypes(),
  });

  // Filter document types based on search query
  const filteredDocumentTypes = useMemo(() => {
    if (!documentTypes) return [];
    if (!searchQuery.trim()) return documentTypes;

    return documentTypes.filter((docType) =>
      docType.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (docType.typeKey && docType.typeKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (docType.typeAttr && docType.typeAttr.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [documentTypes, searchQuery]);

  // Find selected document type
  const selectedDocumentType = useMemo(() => {
    return documentTypes?.find((docType) => docType.id === value);
  }, [documentTypes, value]);

  const handleNext = () => {
    if (!value) {
      setError("Please select a document type");
      return;
    }
    setError("");
    onNext();
  };

  const handleDocumentTypeSelect = (docType: any) => {
    onChange(docType.id);
    setError("");
    setOpen(false);
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    onChange(undefined as any);
    setError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-blue-200">Loading document types...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-blue-200">
          Document Type *
        </Label>
        <p className="text-xs text-blue-300">
          Select the document type that this circuit will handle
        </p>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-2">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="w-full justify-between text-left bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white hover:bg-[#182047]/90 h-auto min-h-[44px] px-3 py-2"
            >
              {selectedDocumentType ? (
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-blue-100">
                      {selectedDocumentType.typeName}
                    </div>
                    {selectedDocumentType.typeKey && (
                      <div className="text-xs text-blue-300">
                        Key: {selectedDocumentType.typeKey}
                      </div>
                    )}
                  </div>
                  {!disabled && (
                    <div
                      role="button"
                      tabIndex={0}
                      className="h-6 w-6 p-0 hover:bg-blue-800/40 rounded-sm flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSelection();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleClearSelection();
                        }
                      }}
                    >
                      <X className="h-3 w-3 text-blue-300" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-blue-300/70">
                  <Search className="h-4 w-4" />
                  <span>Search and select a document type...</span>
                </div>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-blue-300/70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-full p-0 bg-[#0d1541] border-blue-900/50 text-white shadow-lg shadow-blue-900/20"
            align="start"
            style={{ width: 'var(--radix-popover-trigger-width)', maxHeight: '400px' }}
            sideOffset={4}
          >
            {/* Search Header - Fixed */}
            <div className="border-b border-blue-900/20 p-3 bg-[#0d1541]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/70" />
                <Input
                  placeholder="Search document types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-transparent border-blue-900/30 text-blue-100 placeholder:text-blue-300/50 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto"
              style={{ 
                maxHeight: '320px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(30, 58, 138, 0.2)'
              }}
            >
              {filteredDocumentTypes.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <FileText className="h-8 w-8 text-blue-400/50 mx-auto mb-2" />
                  <p className="text-blue-300/70 text-sm">
                    {searchQuery ? 'No document types found' : 'No document types available'}
                  </p>
                  {searchQuery && (
                    <p className="text-blue-400/50 text-xs mt-1">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredDocumentTypes.map((docType, index) => (
                    <div
                      key={docType.id}
                      className={`
                        group relative rounded-lg p-3 cursor-pointer transition-all duration-200 
                        ${docType.id === value 
                          ? 'bg-blue-600/30 ring-1 ring-blue-500/50 shadow-sm' 
                          : 'bg-blue-900/20 hover:bg-blue-800/40 hover:shadow-sm'
                        }
                      `}
                      onClick={() => handleDocumentTypeSelect(docType)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg shrink-0">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-blue-100 truncate">
                              {docType.typeName}
                            </h4>
                            {docType.id === value && (
                              <Check className="h-4 w-4 text-blue-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {docType.typeKey && (
                              <Badge variant="secondary" className="bg-blue-800/40 text-blue-200 text-xs">
                                {docType.typeKey}
                              </Badge>
                            )}
                            {docType.typeAttr && (
                              <Badge variant="outline" className="border-blue-700/50 text-blue-300 text-xs">
                                {docType.typeAttr}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {(!documentTypes || documentTypes.length === 0) && !isLoading && (
        <div className="text-center py-8">
          <div className="bg-blue-500/10 p-4 rounded-lg mb-4 w-fit mx-auto">
            <FileText className="h-12 w-12 text-blue-400 mx-auto" />
          </div>
          <p className="text-blue-200 mb-2 font-medium">No document types available</p>
          <p className="text-xs text-blue-400">
            Please create document types first before creating circuits
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={disabled}
          className="bg-transparent border-blue-600 text-blue-200 hover:bg-blue-900/30"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={disabled || !value}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 