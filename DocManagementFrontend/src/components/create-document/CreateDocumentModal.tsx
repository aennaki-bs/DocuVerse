import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import documentService from "@/services/documentService";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  FileText,
  PlusCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  FileSignature,
  Layers,
  Tag,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Import steps
import { TypeSelectionStep } from "@/components/create-document/steps/TypeSelectionStep";
import { DocumentDetailsStep } from "@/components/create-document/steps/DocumentDetailsStep";
import { DateSelectionStep } from "@/components/create-document/steps/DateSelectionStep";
import { ContentStep } from "@/components/create-document/steps/ContentStep";
import { ReviewStep } from "@/components/create-document/steps/ReviewStep";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: () => void;
}

type Step = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
};

export const CreateDocumentModal = ({
  isOpen,
  onClose,
  onDocumentCreated,
}: CreateDocumentModalProps) => {
  const navigate = useNavigate();

  // Define steps
  const steps: Step[] = [
    {
      id: 1,
      title: "Document Type",
      icon: <Layers className="h-5 w-5" />,
      description: "Select document type and subtype",
    },
    {
      id: 2,
      title: "Document Details",
      icon: <FileSignature className="h-5 w-5" />,
      description: "Enter title and alias",
    },
    {
      id: 3,
      title: "Document Date",
      icon: <Calendar className="h-5 w-5" />,
      description: "Set document date",
    },
    {
      id: 4,
      title: "Content",
      icon: <FileText className="h-5 w-5" />,
      description: "Add document content",
    },
    {
      id: 5,
      title: "Review",
      icon: <Check className="h-5 w-5" />,
      description: "Review and submit",
    },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Form data
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<number | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [documentAlias, setDocumentAlias] = useState("");
  const [docDate, setDocDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [content, setContent] = useState("");

  // Validation errors
  const [dateError, setDateError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [subTypeError, setSubTypeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  // Reset the form when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedTypeId(null);
      setSelectedSubTypeId(null);
      setTitle("");
      setDocumentAlias("");
      setDocDate(new Date().toISOString().split("T")[0]);
      setContent("");
      setDateError(null);
      setTypeError(null);
      setSubTypeError(null);
      setTitleError(null);
      setContentError(null);
      setLoadingError(null);
    }
  }, [isOpen]);

  // Fetch document types
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        console.log("Fetching document types...");

        // Add a small delay to ensure the API is ready
        await new Promise((resolve) => setTimeout(resolve, 500));

        const types = await documentTypeService.getAllDocumentTypes();
        console.log("Document types fetched:", types);

        if (types && Array.isArray(types) && types.length > 0) {
          setDocumentTypes(types);
          console.log("Document types set in state:", types);
        } else {
          console.error("Invalid or empty document types response:", types);

          // Add fallback document types for testing
          const fallbackTypes = [
            { id: 1, typeName: "Invoice", typeKey: "INV" },
            { id: 2, typeName: "Contract", typeKey: "CNT" },
            { id: 3, typeName: "Report", typeKey: "RPT" },
          ];
          console.log("Using fallback document types:", fallbackTypes);
          setDocumentTypes(fallbackTypes);

          setLoadingError(
            "Failed to load document types from API. Using test data."
          );
          toast.warning(
            "Failed to load document types from API. Using test data."
          );
        }
      } catch (error) {
        console.error("Failed to fetch document types:", error);

        // Add fallback document types for testing
        const fallbackTypes = [
          { id: 1, typeName: "Invoice", typeKey: "INV" },
          { id: 2, typeName: "Contract", typeKey: "CNT" },
          { id: 3, typeName: "Report", typeKey: "RPT" },
        ];
        console.log(
          "Using fallback document types after error:",
          fallbackTypes
        );
        setDocumentTypes(fallbackTypes);

        setLoadingError("Failed to load document types. Using test data.");
        toast.error("Failed to load document types. Using test data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchDocumentTypes();
    }
  }, [isOpen]);

  // Fetch subtypes when document type changes
  useEffect(() => {
    const fetchSubTypes = async () => {
      if (selectedTypeId) {
        try {
          setIsLoading(true);
          setSubTypeError(null);
          console.log(
            `Fetching subtypes for document type ID: ${selectedTypeId}`
          );

          const data = await subTypeService.getSubTypesByDocType(
            selectedTypeId
          );
          console.log("Fetched subtypes:", data);

          if (data && Array.isArray(data)) {
            setSubTypes(data);
            setSelectedSubTypeId(null);

            // If no subtypes are available, show a message
            if (data.length === 0) {
              setSubTypeError(
                "The selected document type has no subtypes. Please add subtypes before creating a document."
              );
              toast.warning(
                "The selected document type has no subtypes. Please add subtypes before creating a document."
              );
            }
          } else {
            console.error("Invalid subtypes response:", data);
            setSubTypeError(
              "Failed to load subtypes. Invalid response format."
            );
            toast.error("Failed to load subtypes. Invalid response format.");
            setSubTypes([]);
          }
        } catch (error) {
          console.error("Failed to fetch subtypes:", error);
          setSubTypeError("Failed to load subtypes. Please try again later.");
          toast.error("Failed to load subtypes");
          setSubTypes([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSubTypes([]);
        setSelectedSubTypeId(null);
        setSubTypeError(null);
      }
    };

    fetchSubTypes();
  }, [selectedTypeId]);

  // Update date validation when subtype changes
  useEffect(() => {
    if (selectedSubTypeId && docDate) {
      const selectedSubType = subTypes.find(
        (st) => st.id === selectedSubTypeId
      );
      if (selectedSubType) {
        // Create normalized dates for comparison
        const subTypeStartDate = new Date(selectedSubType.startDate);
        const subTypeEndDate = new Date(selectedSubType.endDate);
        const selectedDate = new Date(docDate);

        // Reset time components for accurate date comparison
        subTypeStartDate.setHours(0, 0, 0, 0);
        subTypeEndDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < subTypeStartDate || selectedDate > subTypeEndDate) {
          setDateError(
            `Date must be within the subtype date range (${subTypeStartDate.toLocaleDateString()} - ${subTypeEndDate.toLocaleDateString()})`
          );

          // Try to set a default date within the range
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (today >= subTypeStartDate && today <= subTypeEndDate) {
            // If today is in range, use it
            setDocDate(today.toISOString().split("T")[0]);
            setDateError(null);
          } else if (today < subTypeStartDate) {
            // If today is before range, use start date
            setDocDate(subTypeStartDate.toISOString().split("T")[0]);
            setDateError(null);
          } else {
            // If today is after range, use end date
            setDocDate(subTypeEndDate.toISOString().split("T")[0]);
            setDateError(null);
          }
        } else {
          setDateError(null);
        }
      }
    }
  }, [selectedSubTypeId, subTypes, docDate]);

  // Handle form field changes
  const handleTypeChange = (typeId: string) => {
    console.log("Type changed to:", typeId);
    setTypeError(null);
    setSelectedTypeId(Number(typeId));
    setSelectedSubTypeId(null);
  };

  const handleSubTypeChange = (subTypeId: string) => {
    console.log("Subtype changed to:", subTypeId);
    setSubTypeError(null);
    setSelectedSubTypeId(Number(subTypeId));
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!value.trim()) {
      setTitleError("Title is required");
    } else {
      setTitleError(null);
    }
  };

  const handleAliasChange = (value: string) => {
    setDocumentAlias(value);
  };

  const handleDocDateChange = (date: Date | undefined) => {
    if (date) {
      try {
        console.log("Date change received:", date);

        // Normalize the date to avoid timezone issues
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        // Format the date as YYYY-MM-DD for storage
        const formattedDate = normalizedDate.toISOString().split("T")[0];
        console.log("Formatted date:", formattedDate);

        setDocDate(formattedDate);

        // Validate against selected subtype date range
        if (selectedSubTypeId) {
          const selectedSubType = subTypes.find(
            (st) => st.id === selectedSubTypeId
          );
          if (selectedSubType) {
            // Create normalized dates for comparison
            const subTypeStartDate = new Date(selectedSubType.startDate);
            const subTypeEndDate = new Date(selectedSubType.endDate);

            // Reset time components for accurate date comparison
            subTypeStartDate.setHours(0, 0, 0, 0);
            subTypeEndDate.setHours(0, 0, 0, 0);

            console.log("Validating date range:", {
              selectedDate: normalizedDate,
              startDate: subTypeStartDate,
              endDate: subTypeEndDate,
            });

            if (
              normalizedDate < subTypeStartDate ||
              normalizedDate > subTypeEndDate
            ) {
              const errorMessage = `Date must be within the subtype date range (${subTypeStartDate.toLocaleDateString()} - ${subTypeEndDate.toLocaleDateString()})`;
              setDateError(errorMessage);
              console.log("Date error:", errorMessage);
            } else {
              console.log("Date is valid within range");
              setDateError(null);
            }
          }
        } else {
          setDateError(null);
        }
      } catch (error) {
        console.error("Error processing date change:", error);
        setDateError("Invalid date format");
      }
    } else {
      // If date is undefined or invalid, set an error
      console.log("Invalid date received");
      setDateError("Please enter a valid date");
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (!value.trim()) {
      setContentError("Content is required");
    } else {
      setContentError(null);
    }
  };

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Document Type & Subtype
        if (!selectedTypeId) {
          setTypeError("Please select a document type");
          toast.error("Please select a document type");
          return false;
        }

        // Check if subtypes are still loading
        if (isLoading) {
          toast.error("Please wait while subtypes are loading");
          return false;
        }

        if (subTypes.length === 0) {
          setSubTypeError(
            "The selected document type has no subtypes. Please add subtypes first."
          );
          toast.error(
            "The selected document type has no subtypes. Please add subtypes first."
          );
          return false;
        }

        if (subTypes.length > 0 && !selectedSubTypeId) {
          setSubTypeError("Please select a subtype");
          toast.error("Please select a subtype");
          return false;
        }
        return true;

      case 2: // Document Details
        if (!title.trim()) {
          setTitleError("Please enter a document title");
          toast.error("Please enter a document title");
          return false;
        }
        return true;

      case 3: // Document Date
        if (!docDate) {
          setDateError("Please select a document date");
          toast.error("Please select a document date");
          return false;
        }

        if (dateError) {
          toast.error(dateError);
          return false;
        }

        // Validate against subtype date range
        if (selectedSubTypeId) {
          const selectedSubType = subTypes.find(
            (st) => st.id === selectedSubTypeId
          );
          if (selectedSubType) {
            try {
              // Create normalized dates for comparison
              const subTypeStartDate = new Date(selectedSubType.startDate);
              const subTypeEndDate = new Date(selectedSubType.endDate);
              const selectedDate = new Date(docDate);

              // Reset time components for accurate date comparison
              subTypeStartDate.setHours(0, 0, 0, 0);
              subTypeEndDate.setHours(0, 0, 0, 0);
              selectedDate.setHours(0, 0, 0, 0);

              console.log("Validating date before next step:", {
                selectedDate,
                startDate: subTypeStartDate,
                endDate: subTypeEndDate,
                isValid:
                  selectedDate >= subTypeStartDate &&
                  selectedDate <= subTypeEndDate,
              });

              if (
                selectedDate < subTypeStartDate ||
                selectedDate > subTypeEndDate
              ) {
                const errorMessage = `Date must be within the subtype date range (${subTypeStartDate.toLocaleDateString()} - ${subTypeEndDate.toLocaleDateString()})`;
                setDateError(errorMessage);
                toast.error(errorMessage);
                console.log("Date validation failed:", errorMessage);
                return false;
              }

              console.log("Date validation passed");
            } catch (error) {
              console.error("Date validation error:", error);
              setDateError("Invalid date format");
              toast.error("Invalid date format");
              return false;
            }
          }
        }
        return true;

      case 4: // Document Content
        if (!content.trim()) {
          setContentError("Please enter document content");
          toast.error("Please enter document content");
          return false;
        }
        setContentError(null);
        return true;

      case 5: // Review
        return true;

      default:
        return true;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    console.log("Attempting to move to next step from step", currentStep);
    if (validateCurrentStep()) {
      console.log("Validation passed, moving to next step");
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      console.log("Validation failed, staying on current step");
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const documentData = {
        title,
        content,
        typeId: selectedTypeId,
        documentAlias,
        docDate,
        subTypeId: selectedSubTypeId,
      };

      console.log("Submitting document data:", documentData);
      const createdDocument = await documentService.createDocument(
        documentData
      );
      toast.success("Document created successfully");
      onDocumentCreated();
      onClose();
      // Redirect to the document view page
      navigate(`/documents/${createdDocument.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jump to a specific step (for review editing)
  const jumpToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Document Type & Subtype
        return (
          <TypeSelectionStep
            documentTypes={documentTypes}
            subTypes={subTypes}
            selectedTypeId={selectedTypeId}
            selectedSubTypeId={selectedSubTypeId}
            documentAlias={documentAlias}
            onTypeChange={handleTypeChange}
            onSubTypeChange={handleSubTypeChange}
            onAliasChange={handleAliasChange}
            typeError={typeError}
            subTypeError={subTypeError}
          />
        );

      case 2: // Document Details
        return (
          <DocumentDetailsStep
            title={title}
            documentAlias={documentAlias}
            onTitleChange={handleTitleChange}
            onAliasChange={handleAliasChange}
            titleError={titleError}
          />
        );

      case 3: // Document Date
        return (
          <DateSelectionStep
            docDate={docDate}
            dateError={dateError}
            onDateChange={handleDocDateChange}
            selectedSubType={
              selectedSubTypeId
                ? subTypes.find((st) => st.id === selectedSubTypeId)
                : null
            }
          />
        );

      case 4: // Document Content
        return (
          <ContentStep
            content={content}
            onContentChange={handleContentChange}
            contentError={contentError}
          />
        );

      case 5: // Review
        return (
          <ReviewStep
            selectedType={documentTypes.find((t) => t.id === selectedTypeId)}
            selectedSubType={subTypes.find((st) => st.id === selectedSubTypeId)}
            documentAlias={documentAlias}
            title={title}
            docDate={docDate}
            content={content}
            onEditTypeClick={() => jumpToStep(1)}
            onEditDetailsClick={() => jumpToStep(2)}
            onEditDateClick={() => jumpToStep(3)}
            onEditContentClick={() => jumpToStep(4)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-[#0d1117] border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-white">Create Document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-between items-center px-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center space-y-2 relative",
                  step.id < currentStep
                    ? "text-green-500"
                    : step.id === currentStep
                    ? "text-blue-500"
                    : "text-gray-500"
                )}
              >
                {/* Connector line */}
                {step.id < steps.length && (
                  <div
                    className={cn(
                      "absolute top-4 h-0.5 w-[150%] -right-1/2 z-0",
                      step.id < currentStep ? "bg-green-500" : "bg-gray-700"
                    )}
                  />
                )}

                {/* Step circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10",
                    step.id < currentStep
                      ? "bg-green-500 text-white"
                      : step.id === currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step title */}
                <div
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    step.id === currentStep ? "text-blue-400" : "text-gray-400"
                  )}
                >
                  {step.title}
                </div>
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="border-b border-gray-800 pb-4">
            <h2 className="text-xl font-semibold text-center text-white flex items-center justify-center gap-2">
              {steps[currentStep - 1].icon}
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-center text-gray-400 text-sm mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Loading & Error States */}
          {isLoading && currentStep === 1 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-blue-400">Loading document types...</p>
            </div>
          ) : loadingError && currentStep === 1 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full h-12 w-12 bg-red-900/20 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-red-400 mb-4">{loadingError}</p>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                asChild
              >
                <Link to="/document-types-management">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Manage Document Types
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Step Content */}
              <div className="min-h-[300px]">{renderStepContent()}</div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  onClick={currentStep === 1 ? onClose : handlePrevStep}
                  disabled={isSubmitting}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  {currentStep === 1 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>

                {currentStep === steps.length ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Document
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
