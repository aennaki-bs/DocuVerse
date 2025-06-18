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
  Calendar,
  Loader2,
  FileWarning,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";

interface TypeSelectionWithDateFilterStepProps {
  documentTypes: DocumentType[];
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  onTypeChange: (value: string) => void;
  onSubTypeChange: (value: string) => void;
  typeError?: string | null;
  subTypeError?: string | null;
  documentDate: string;
  jumpToDateStep?: () => void;
}

export const TypeSelectionWithDateFilterStep = ({
  documentTypes,
  selectedTypeId,
  selectedSubTypeId,
  onTypeChange,
  onSubTypeChange,
  typeError,
  subTypeError,
  documentDate,
  jumpToDateStep,
}: TypeSelectionWithDateFilterStepProps) => {
  const { t } = useTranslation();
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [filteredSubTypes, setFilteredSubTypes] = useState<SubType[]>([]);
  const [noSubTypesAvailable, setNoSubTypesAvailable] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<DocumentType[]>([]);

  // Helper function to format date for API
  const formatDateForAPI = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toISOString();
  };

  // Custom select state
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subtypeDropdownOpen, setSubtypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = selectedTypeId
    ? documentTypes.find((type) => type.id === selectedTypeId)
    : null;

  const selectedSubType = selectedSubTypeId
    ? filteredSubTypes.find((subtype) => subtype.id === selectedSubTypeId)
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

  // Set available types immediately to show all types initially
  useEffect(() => {
    // Initially show all document types
    setAvailableTypes(documentTypes);
  }, [documentTypes]);

  // Filter document types based on the selected date
  useEffect(() => {
    const fetchAvailableTypesForDate = async () => {
      try {
        if (!documentDate) {
          setAvailableTypes(documentTypes);
          return;
        }

        setIsLoadingTypes(true);

        // Format date correctly for API - needs exact ISO format
        const formattedDate = formatDateForAPI(documentDate);

        console.log(`Filtering document types for date: ${formattedDate}`);

        // For each document type, check if there are active series for this date
        const validTypes: DocumentType[] = [];

        for (const docType of documentTypes) {
          if (!docType.id) continue;

          try {
            console.log(
              `Checking active series for document type ${docType.id} (${docType.typeName})`
            );

            // Direct API call to get series for this type and date
            const response = await api.get(
              `/Series/for-date/${docType.id}/${formattedDate}`
            );

            if (response.data && Array.isArray(response.data)) {
              // Filter for active series only
              const activeSeries = response.data.filter(
                (series) => series.isActive
              );

              console.log(
                `Found ${response.data.length} series, ${activeSeries.length} active for type ${docType.id}`
              );

              // Only include document types that have at least one active series
              if (activeSeries.length > 0) {
                validTypes.push(docType);
                console.log(
                  `Adding document type ${docType.id} to valid types`
                );
              } else {
                console.log(
                  `Document type ${docType.id} has no active series - excluding`
                );
              }
            }
          } catch (error) {
            console.error(
              `Error checking series for document type ${docType.id}:`,
              error
            );
          }
        }

        console.log(
          `Found ${validTypes.length} valid document types out of ${documentTypes.length}`
        );

        if (validTypes.length > 0) {
          setAvailableTypes(validTypes);
        } else {
          // If no valid types found, show empty state
          setAvailableTypes([]);
          toast.warning(
            "No document types have active series for the selected date",
            {
              description:
                "Please select a different date or create new series with valid date ranges.",
              duration: 5000,
              icon: <FileWarning className="h-5 w-5 text-amber-400" />,
            }
          );
        }

        // If the currently selected type is not valid for this date, clear it
        if (
          selectedTypeId &&
          !validTypes.find((t) => t.id === selectedTypeId)
        ) {
          onTypeChange("");
          onSubTypeChange("");
          toast.info(
            "Selected document type is not valid for the chosen date",
            {
              description:
                "Your selection has been reset. Please choose from available types.",
              duration: 4000,
            }
          );
        }
      } catch (error) {
        console.error("Error filtering document types by date:", error);
        toast.error("Failed to filter document types", {
          description:
            "There was a problem loading document types for the selected date.",
          duration: 4000,
        });
        setAvailableTypes([]);
      } finally {
        setIsLoadingTypes(false);
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
          // Format date correctly for API call
          const formattedDate = formatDateForAPI(documentDate);

          console.log(
            `Fetching series for document type ${selectedTypeId} with date ${formattedDate}`
          );

          // Direct API call to get series
          const response = await api.get(
            `/Series/for-date/${selectedTypeId}/${formattedDate}`
          );

          if (response.data && Array.isArray(response.data)) {
            // Filter for active series only
            const activeSeries = response.data.filter(
              (series) => series.isActive
            );

            console.log(
              `Found ${response.data.length} series, ${activeSeries.length} active`
            );

            if (activeSeries.length > 0) {
              setFilteredSubTypes(activeSeries);
              setNoSubTypesAvailable(false);

              // Auto-select if there's only one active series
              if (activeSeries.length === 1 && !selectedSubTypeId) {
                const autoSelectedSeries = activeSeries[0];
                console.log('Auto-selecting single available series:', autoSelectedSeries.subTypeKey);
                onSubTypeChange(autoSelectedSeries.id?.toString() || "");
                toast.success(
                  `Series "${autoSelectedSeries.subTypeKey}" automatically selected`,
                  {
                    description: "This is the only valid series available for the selected type and date.",
                    duration: 4000,
                  }
                );
              }
            } else {
              setFilteredSubTypes([]);
              setNoSubTypesAvailable(true);
              toast.warning(
                "No active series available for this document type on the selected date",
                {
                  description:
                    "Please select a different document type or date.",
                  duration: 4000,
                }
              );
            }

            // If the currently selected series is not valid for this date, clear it
            if (
              selectedSubTypeId &&
              !activeSeries.find((s) => s.id === selectedSubTypeId)
            ) {
              onSubTypeChange("");
              toast.info("Selected series is not valid for the chosen date", {
                description:
                  "Your selection has been reset. Please choose from available series.",
                duration: 3000,
              });
            }
          } else {
            console.error("Invalid response format:", response.data);
            setFilteredSubTypes([]);
            setNoSubTypesAvailable(true);
          }
        } catch (error) {
          console.error("Failed to load series for date:", error);
          toast.error("Failed to load series", {
            description:
              "There was a problem loading series for the selected document type and date.",
            duration: 4000,
          });

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
      {/* Date Filter Info */}
      <Card className="bg-blue-900/20 border-blue-800/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 mt-0.5 text-blue-400" />
            <div>
              <h4 className="text-sm font-medium text-blue-400">
                {t("documents.filteringByDocumentDate")}
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                <strong>{t("common.important")}:</strong> {t("documents.onlyShowingDocumentTypesAndSeries")}
                <span className="text-green-400"> {t("common.active")}</span> {t("documents.andValidFor")}{" "}
                <span className="font-medium text-white">
                  {format(new Date(documentDate), "MMMM d, yyyy")}
                </span>
              </p>
            </div>
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
          {t("documents.documentType")}*
        </Label>

        {isLoadingTypes ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-gray-800/50" />
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("documents.loadingDocumentTypesForDate")}</span>
            </div>
          </div>
        ) : availableTypes.length === 0 ? (
          <Card className="bg-amber-900/20 border-amber-800/40">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm">
                    No document types have valid series for the selected date (
                    {format(new Date(documentDate), "MMM d, yyyy")}).
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      onClick={() => {
                        // Go back to the first step to change date
                        if (jumpToDateStep) {
                          jumpToDateStep();
                        } else {
                          toast.info("Please select a different date", {
                            description:
                              "Try choosing another date that has valid document types and series.",
                            duration: 3000,
                          });
                        }
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Change Date
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      asChild
                    >
                      <Link to="/document-types-management">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Document Type
                      </Link>
                    </Button>
                  </div>
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
                    : t("documents.selectDocumentType")}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    typeDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {typeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-100">
                  {availableTypes.map((type) => (
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
          Only showing document types with{" "}
          <span className="text-green-400 font-medium">active</span> series for
          the selected date
        </p>
      </div>

      {/* Series Selection */}
      {selectedTypeId && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-800/50">
          <Label
            htmlFor="subType"
            className="text-sm font-medium text-gray-200 flex items-center gap-2"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            Series*
          </Label>
          {isLoadingSubTypes ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full bg-gray-800/50" />
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading series for selected document type...</span>
              </div>
            </div>
          ) : noSubTypesAvailable ? (
            <Card className="bg-amber-900/20 border-amber-800/40">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 text-amber-400">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm">
                      No series available for{" "}
                      <strong>{selectedType?.typeName}</strong> on{" "}
                      {format(new Date(documentDate), "MMMM d, yyyy")}.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        onClick={() => {
                          onTypeChange("");
                          toast.info(
                            "Please select a different document type",
                            {
                              description:
                                "Try choosing another document type that has valid series.",
                              duration: 3000,
                            }
                          );
                        }}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Change Type
                      </Button>

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
                </div>
              </CardContent>
            </Card>
          ) : filteredSubTypes.length === 1 ? (
            // Show confirmation card when there's only one series (auto-selected)
            <Card className="bg-green-900/20 border-green-800/40">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5 mt-0.5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    {/* <h4 className="text-sm font-medium text-green-400 mb-2">
                      Series Automatically Selected
                    </h4> */}
                    <div className="bg-gray-800/50 rounded-md p-3 border border-gray-700">
                      <div className="font-medium text-white">
                        {selectedSubType?.subTypeKey}
                      </div>
                      {selectedSubType?.name && (
                        <div className="text-sm text-gray-300 mt-1">
                          {selectedSubType.name}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 flex items-center mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Valid: {selectedSubType && format(new Date(selectedSubType.startDate), "MMM d, yyyy")} -{" "}
                        {selectedSubType && format(new Date(selectedSubType.endDate), "MMM d, yyyy")}
                      </div>
                    </div>
                    <p className="text-sm text-green-300 mt-2">
                      This is the only valid series for <strong>{selectedType?.typeName}</strong> on the selected date.
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      You can proceed to the next step or change the document type if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Custom Series Select - Only show when there are multiple options */}
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
                  data-testid="subtype-select"
                >
                  <span
                    className={
                      selectedSubTypeId ? "text-white" : "text-gray-500"
                    }
                  >
                    {selectedSubType
                      ? selectedSubType.subTypeKey
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
                          handleSubtypeSelect(subType.id?.toString() || "")
                        }
                      >
                        <div className="font-medium">{subType.subTypeKey}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {subType.name}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mt-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          Valid:{" "}
                          {format(
                            new Date(subType.startDate),
                            "MMM d, yyyy"
                          )} -{" "}
                          {format(new Date(subType.endDate), "MMM d, yyyy")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {subTypeError && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {subTypeError}
            </p>
          )}
          {filteredSubTypes.length > 1 && (
            <p className="text-sm text-gray-400">
              Only showing{" "}
              <span className="text-green-400 font-medium">active</span> series
              valid for the selected date
            </p>
          )}
        </div>
      )}

      {/* Show selected series details - only for multiple series selection */}
      {selectedSubType && filteredSubTypes.length > 1 && (
        <Card className="bg-blue-900/20 border-blue-800/40 mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-blue-400" />
              <div>
                <h4 className="text-sm font-medium text-blue-400">
                  Selected:{" "}
                  <span className="text-white">
                    {selectedSubType.subTypeKey}
                  </span>
                  {selectedSubType.name && (
                    <span className="text-gray-300 ml-2 text-xs">
                      ({selectedSubType.name})
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  {selectedSubType.description || "No description available"}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Valid period:{" "}
                  {format(
                    new Date(selectedSubType.startDate),
                    "MMMM d, yyyy"
                  )}{" "}
                  - {format(new Date(selectedSubType.endDate), "MMMM d, yyyy")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
