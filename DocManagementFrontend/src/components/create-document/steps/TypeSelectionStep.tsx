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
  PlusCircle,
  Info,
  Layers,
  Tag,
  ChevronDown,
  Clock,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import subTypeService from "@/services/subTypeService";
import { toast } from "sonner";

interface TypeSelectionStepProps {
  documentTypes: DocumentType[];
  subTypes: SubType[];
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  documentAlias?: string;
  onTypeChange: (value: string) => void;
  onSubTypeChange: (value: string) => void;
  onAliasChange?: (value: string) => void;
  typeError?: string | null;
  subTypeError?: string | null;
  isLoadingTypes?: boolean;
  isLoadingSubTypes?: boolean;
}

export const TypeSelectionStep = ({
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
}: TypeSelectionStepProps) => {
  const [localIsLoadingSubTypes, setLocalIsLoadingSubTypes] = useState(false);
  const [filteredSubTypes, setFilteredSubTypes] = useState<SubType[]>([]);
  const [noSubTypesAvailable, setNoSubTypesAvailable] = useState(false);

  // Custom select state
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subtypeDropdownOpen, setSubtypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = selectedTypeId
    ? documentTypes.find((type) => type.id === selectedTypeId)
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

  // Update filtered subtypes when document type changes or when subTypes prop changes
  useEffect(() => {
    if (selectedTypeId) {
      setLocalIsLoadingSubTypes(true);
      setNoSubTypesAvailable(false);

      // Use the subTypes prop if it's already filtered for the selected type
      if (subTypes && subTypes.length > 0) {
        setFilteredSubTypes(subTypes);
        setNoSubTypesAvailable(subTypes.length === 0);
        setLocalIsLoadingSubTypes(false);
      } else {
        // Fetch subtypes for the selected document type if not provided
        subTypeService
          .getSubTypesByDocType(selectedTypeId)
          .then((data) => {
            // Filter only active subtypes
            const activeSubTypes = data.filter((subType) => subType.isActive);
            setFilteredSubTypes(activeSubTypes);
            if (activeSubTypes.length === 0) {
              setNoSubTypesAvailable(true);
            }
          })
          .catch((error) => {
            console.error("Failed to load subtypes:", error);
            toast.error(
              "Failed to load subtypes for the selected document type"
            );
            setFilteredSubTypes([]);
            setNoSubTypesAvailable(true);
          })
          .finally(() => {
            setLocalIsLoadingSubTypes(false);
          });
      }
    } else {
      setFilteredSubTypes([]);
      setNoSubTypesAvailable(false);
    }
  }, [selectedTypeId, subTypes]);

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
          <div className="flex items-center space-x-3 text-blue-400 text-sm py-4 px-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-400 rounded-full border-t-transparent"></div>
            <span>Loading document types with active series...</span>
          </div>
        ) : documentTypes.length === 0 ? (
          <Card className="bg-gray-800/50 border-amber-700/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm">
                    No document types with active series available for the selected date. Please select a different date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Custom Document Type Select */}
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
                <span
                  className={selectedTypeId ? "text-white" : "text-gray-500"}
                >
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
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-100">
                  {documentTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
                        selectedTypeId === type.id
                          ? "bg-blue-900/40 text-blue-300 font-medium"
                          : "text-gray-200"
                      }`}
                      onClick={() =>
                        handleTypeSelect(type.id?.toString() || "")
                      }
                    >
                      {type.typeName} {type.typeKey ? `(${type.typeKey})` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {typeError && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {typeError}
          </p>
        )}
        <p className="text-sm text-gray-400">
          Select the type of document you want to create
        </p>
      </div>

      {/* Subtype Selection */}
      {selectedTypeId && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-800/50">
          <Label
            htmlFor="subType"
            className="text-sm font-medium text-gray-200 flex items-center gap-2"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            Series*
          </Label>
          {isLoadingSubTypes || localIsLoadingSubTypes ? (
            <div className="flex items-center space-x-3 text-blue-400 text-sm py-2 px-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent"></div>
              <span>Loading series...</span>
            </div>
          ) : noSubTypesAvailable ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 text-amber-400">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm">
                      No active series available for this document type.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      asChild
                    >
                      <Link to={`/document-types/${selectedTypeId}/subtypes`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Series
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Custom Series Select */}
              <div className="relative" ref={subtypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSubtypeDropdownOpen(!subtypeDropdownOpen)}
                  className={`flex items-center justify-between w-full h-10 px-3 py-2 text-base bg-gray-900 border ${
                    subTypeError
                      ? "border-red-500"
                      : subtypeDropdownOpen
                      ? "border-blue-500 ring-1 ring-blue-500/30"
                      : "border-gray-800 hover:border-gray-700"
                  } rounded-md text-white transition-all duration-200`}
                  data-testid="document-subtype-select"
                >
                  <span
                    className={
                      selectedSubTypeId ? "text-white" : "text-gray-500"
                    }
                  >
                    {selectedSubTypeId
                      ? filteredSubTypes.find(
                          (st) => st.id === selectedSubTypeId
                        )?.name || "Select series"
                      : "Select series"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      subtypeDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {subtypeDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-100">
                    {filteredSubTypes.map((subType) => (
                      <div
                        key={subType.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
                          selectedSubTypeId === subType.id
                            ? "bg-blue-900/40 text-blue-300 font-medium"
                            : "text-gray-200"
                        }`}
                        onClick={() =>
                          handleSubtypeSelect(subType.id.toString())
                        }
                      >
                        {subType.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {subTypeError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {subTypeError}
                </p>
              )}

              {selectedSubTypeId && (
                <div className="bg-gray-800/40 border border-gray-700 rounded-md p-3 mt-3">
                  <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Selected Series Information</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Code: </span>
                    {filteredSubTypes.find((st) => st.id === selectedSubTypeId)
                      ?.subTypeKey || ""}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    <span className="font-medium">Valid period: </span>
                    {new Date(
                      filteredSubTypes.find(
                        (st) => st.id === selectedSubTypeId
                      )?.startDate!
                    ).toLocaleDateString()}
                    {" to "}
                    {new Date(
                      filteredSubTypes.find(
                        (st) => st.id === selectedSubTypeId
                      )?.endDate!
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
