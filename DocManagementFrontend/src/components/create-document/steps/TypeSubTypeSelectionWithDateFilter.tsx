import React, { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Tag,
  Layers,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import subTypeService from "@/services/subTypeService";
import { toast } from "sonner";

interface TypeSubTypeSelectionWithDateFilterProps {
  documentTypes: DocumentType[];
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  onTypeChange: (value: string) => void;
  onSubTypeChange: (value: string) => void;
  typeError?: string | null;
  subTypeError?: string | null;
  isLoadingTypes?: boolean;
  documentDate: string;
}

export const TypeSubTypeSelectionWithDateFilter = ({
  documentTypes,
  selectedTypeId,
  selectedSubTypeId,
  onTypeChange,
  onSubTypeChange,
  typeError,
  subTypeError,
  isLoadingTypes = false,
  documentDate,
}: TypeSubTypeSelectionWithDateFilterProps) => {
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subtypeDropdownOpen, setSubtypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  // States for date-filtered data
  const [availableTypes, setAvailableTypes] = useState<DocumentType[]>([]);
  const [filteredSubTypes, setFilteredSubTypes] = useState<SubType[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(false);
  const [noSubTypesAvailable, setNoSubTypesAvailable] = useState(false);

  const selectedType = selectedTypeId
    ? availableTypes.find((type) => type.id === selectedTypeId)
    : null;

  const selectedSubType = selectedSubTypeId
    ? filteredSubTypes.find((subType) => subType.id === selectedSubTypeId)
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

  // Filter document types based on the selected date
  useEffect(() => {
    const fetchAvailableTypesForDate = async () => {
      try {
        if (!documentDate) {
          setAvailableTypes(documentTypes);
          return;
        }

        // For each document type, check if there are valid subtypes for this date
        const validTypes: DocumentType[] = [];
        const docDate = new Date(documentDate);

        for (const docType of documentTypes) {
          if (!docType.id) continue;

          try {
            // Get subtypes that are valid for the selected date
            const subtypes = await subTypeService.getSubTypesForDate(
              docType.id,
              docDate
            );

            // If there are any valid subtypes for this date, include the document type
            if (subtypes && subtypes.length > 0) {
              validTypes.push(docType);
            }
          } catch (error) {
            console.error(
              `Error checking subtypes for document type ${docType.id}:`,
              error
            );
          }
        }

        setAvailableTypes(validTypes);

        // If the currently selected type is not valid for this date, clear it
        if (
          selectedTypeId &&
          !validTypes.find((t) => t.id === selectedTypeId)
        ) {
          onTypeChange("");
          onSubTypeChange("");
        }
      } catch (error) {
        console.error("Error filtering document types by date:", error);
        toast.error("Failed to filter document types for the selected date");
        setAvailableTypes(documentTypes);
      }
    };

    fetchAvailableTypesForDate();
  }, [
    documentDate,
    documentTypes,
    selectedTypeId,
    onTypeChange,
    onSubTypeChange,
  ]);

  // Update filtered subtypes when document type changes
  useEffect(() => {
    if (selectedTypeId) {
      setIsLoadingSubTypes(true);
      setNoSubTypesAvailable(false);

      const fetchSubTypesForDate = async () => {
        try {
          const docDate = new Date(documentDate);

          // Get subtypes that are valid for the selected date
          const subtypes = await subTypeService.getSubTypesForDate(
            selectedTypeId,
            docDate
          );

          setFilteredSubTypes(subtypes);
          setNoSubTypesAvailable(subtypes.length === 0);

          // If the currently selected subtype is not valid for this date, clear it
          if (
            selectedSubTypeId &&
            !subtypes.find((st) => st.id === selectedSubTypeId)
          ) {
            onSubTypeChange("");
          }
        } catch (error) {
          console.error("Failed to load subtypes for date:", error);
          toast.error(
            "Failed to load subtypes for the selected document type and date"
          );
          setFilteredSubTypes([]);
          setNoSubTypesAvailable(true);
        } finally {
          setIsLoadingSubTypes(false);
        }
      };

      fetchSubTypesForDate();
    } else {
      setFilteredSubTypes([]);
      setNoSubTypesAvailable(false);
    }
  }, [selectedTypeId, documentDate, selectedSubTypeId, onSubTypeChange]);

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
      {/* Date Information */}
      <Card className="bg-blue-900/10 backdrop-blur-sm border border-blue-800/40">
        <CardContent className="p-4 flex items-start gap-3">
          <Calendar className="h-5 w-5 mt-0.5 text-blue-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-400">
              Date-Filtered Selection
            </h4>
            <p className="text-sm text-gray-300 mt-1">
              Only showing document types and subtypes that are valid for the
              selected document date:
              <span className="font-medium text-white ml-1">
                {new Date(documentDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

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
        ) : availableTypes.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No document types available for the selected date. Please
                    select a different date or contact an administrator.
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
                  {availableTypes.map((type) => (
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
          Document Subtype
        </Label>

        {!selectedTypeId ? (
          <p className="text-sm text-gray-400">Select a document type first</p>
        ) : isLoadingSubTypes ? (
          <div className="flex items-center text-gray-400 space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading subtypes...</span>
          </div>
        ) : filteredSubTypes.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No subtypes available for this document type and date.
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
                  ? selectedSubType.name
                  : "Select document subtype (optional)"}
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
                  {filteredSubTypes.map((subType) => (
                    <button
                      key={subType.id}
                      onClick={() => handleSubtypeSelect(String(subType.id))}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 focus:outline-none ${
                        selectedSubTypeId === subType.id
                          ? "bg-purple-600 bg-opacity-20 text-purple-400"
                          : "text-white"
                      }`}
                    >
                      {subType.name}
                      {subType.subTypeKey && (
                        <span className="text-gray-400 ml-1">
                          ({subType.subTypeKey})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {subTypeError && <p className="text-sm text-red-500">{subTypeError}</p>}
      </div>
    </div>
  );
};
