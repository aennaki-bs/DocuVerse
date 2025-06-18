import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Tag,
  Layers,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TypeSubTypeSelectionStepProps {
  documentTypes: DocumentType[];
  subTypes: SubType[];
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  onTypeChange: (value: string) => void;
  onSubTypeChange: (value: string) => void;
  typeError?: string | null;
  subTypeError?: string | null;
  isLoadingTypes?: boolean;
  isLoadingSubTypes?: boolean;
}

export const TypeSubTypeSelectionStep = ({
  documentTypes,
  subTypes,
  selectedTypeId,
  selectedSubTypeId,
  onTypeChange,
  onSubTypeChange,
  typeError,
  subTypeError,
  isLoadingTypes = false,
  isLoadingSubTypes = false,
}: TypeSubTypeSelectionStepProps) => {
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subtypeDropdownOpen, setSubtypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = selectedTypeId
    ? documentTypes.find((type) => type.id === selectedTypeId)
    : null;

  const selectedSubType = selectedSubTypeId
    ? subTypes.find((subType) => subType.id === selectedSubTypeId)
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setTypeDropdownOpen(false);
      }
      if (
        subtypeDropdownRef.current &&
        !subtypeDropdownRef.current.contains(event.target as Node)
      ) {
        setSubtypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeSelect = (typeId: string) => {
    onTypeChange(typeId);
    setTypeDropdownOpen(false);
  };

  const handleSubtypeSelect = (subtypeId: string) => {
    onSubTypeChange(subtypeId);
    setSubtypeDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div className="space-y-3">
        <Label
          htmlFor="documentType"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <Tag className="h-4 w-4 text-blue-400" />
          Document Type*
        </Label>

        {isLoadingTypes ? (
          <div className="flex items-center text-gray-400 space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading document types...</span>
          </div>
        ) : documentTypes.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No document types with active series available for the selected date. Please select a different date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className={`flex items-center justify-between w-full h-10 px-3 py-2 text-base bg-gray-900 border ${
                typeError
                  ? "border-red-500"
                  : typeDropdownOpen
                  ? "border-blue-500 ring-1 ring-blue-500/30"
                  : "border-gray-800 hover:border-gray-700"
              } rounded-md text-white transition-all duration-200`}
              data-testid="document-type-select"
            >
              <span className={selectedTypeId ? "text-white" : "text-gray-500"}>
                {selectedType
                  ? `${selectedType.typeName} ${
                      selectedType.typeKey ? `(${selectedType.typeKey})` : ""
                    }`
                  : "Select document type"}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  typeDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {typeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-900 border border-gray-800 shadow-lg">
                <div className="max-h-60 overflow-auto py-1">
                  {documentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(String(type.id))}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 focus:outline-none ${
                        selectedTypeId === type.id
                          ? "bg-blue-600 bg-opacity-20 text-blue-400"
                          : "text-white"
                      }`}
                    >
                      {type.typeName}
                      {type.typeKey && (
                        <span className="text-gray-400 ml-1">
                          ({type.typeKey})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {typeError && <p className="text-sm text-red-500">{typeError}</p>}
      </div>

      {/* Subtype Selection */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <Label
          htmlFor="documentSubType"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <Layers className="h-4 w-4 text-purple-400" />
          Document Series
        </Label>

        {!selectedTypeId ? (
          <p className="text-sm text-gray-400">Select a document type first</p>
        ) : isLoadingSubTypes ? (
          <div className="flex items-center text-gray-400 space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading series...</span>
          </div>
        ) : selectedTypeId && !isLoadingSubTypes && subTypes.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No active series available for this document type on the selected date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : subTypes.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No series available for this document type.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative" ref={subtypeDropdownRef}>
            <button
              type="button"
              onClick={() => setSubtypeDropdownOpen(!subtypeDropdownOpen)}
              className={`flex items-center justify-between w-full h-10 px-3 py-2 text-base bg-gray-900 border ${
                subTypeError
                  ? "border-red-500"
                  : subtypeDropdownOpen
                  ? "border-purple-500 ring-1 ring-purple-500/30"
                  : "border-gray-800 hover:border-gray-700"
              } rounded-md text-white transition-all duration-200`}
              data-testid="document-subtype-select"
            >
              <span
                className={selectedSubTypeId ? "text-white" : "text-gray-500"}
              >
                {selectedSubType
                  ? selectedSubType.subTypeKey
                  : "Select document series"}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  subtypeDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {subtypeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-900 border border-gray-800 shadow-lg">
                <div className="max-h-60 overflow-auto py-1">
                  {subTypes.map((subtype) => (
                    <button
                      key={subtype.id}
                      onClick={() => handleSubtypeSelect(String(subtype.id))}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 focus:outline-none ${
                        selectedSubTypeId === subtype.id
                          ? "bg-purple-600 bg-opacity-20 text-purple-400"
                          : "text-white"
                      }`}
                    >
                      <span className="font-medium">{subtype.subTypeKey}</span>
                      {subtype.name && (
                        <span className="text-gray-400 ml-2 text-xs">
                          {subtype.name}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {subTypes.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            <Info className="h-3.5 w-3.5 inline mr-1" />
            Only showing active series that are valid for the selected document date.
          </p>
        )}

        {subTypeError && <p className="text-sm text-red-500">{subTypeError}</p>}
      </div>

      <Card className="bg-blue-900 bg-opacity-20 border border-blue-800">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-blue-400">
            Document Classification
          </h4>
          <p className="text-sm text-gray-300 mt-1">
            The document type defines the category of the document, while the
            series provides more specific classification within that category.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
