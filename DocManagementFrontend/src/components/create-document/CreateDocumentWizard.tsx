import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  FileText,
  Calendar,
  Layers,
  Save,
  CheckCircle,
  Share2,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import documentService from "@/services/documentService";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { checkApiConnection } from "@/services/api";
import circuitService from "@/services/circuitService";
import { useTranslation } from "@/hooks/useTranslation";

// Import step components
import { DateSelectionStep } from "./steps/DateSelectionStep";
import { TypeSelectionWithDateFilterStep } from "./steps/TypeSelectionWithDateFilterStep";
import { CustomerVendorSelectionStep } from "./steps/CustomerVendorSelectionStep";
import { ContentStep } from "./steps/ContentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CircuitAssignmentStep } from "./steps/CircuitAssignmentStep";
import { ResponsibilityCentreStep } from "./steps/ResponsibilityCentreStep";

interface CreateDocumentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

// Form data interface
interface FormData {
  docDate: string;
  comptableDate: string | null;
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  title: string;
  documentAlias: string;
  content: string;
  circuitId: number | null;
  circuitName: string;
  isExternal: boolean;
  externalReference: string;
  responsibilityCentreId: number | null;
  // Customer/Vendor fields
  selectedCustomerVendor: any;
  customerVendorName: string;
  customerVendorAddress: string;
  customerVendorCity: string;
  customerVendorCountry: string;
}

const MotionDiv = motion.div;

export default function CreateDocumentWizard({
  open,
  onOpenChange,
  onSuccess,
}: CreateDocumentWizardProps) {
  // Add navigate function
  const navigate = useNavigate();
  // Get user auth context
  const { user } = useAuth();
  // Get translation function
  const { t } = useTranslation();

  // Check if user has a responsibility centre
  const userHasResponsibilityCentre =
    user?.responsibilityCentre?.id !== undefined || user?.responsibilityCenter?.id !== undefined;

  // Get user's responsibility centre ID
  const getUserResponsibilityCentreId = () => {
    return user?.responsibilityCentre?.id || user?.responsibilityCenter?.id || null;
  };

  // Get user's responsibility centre name  
  const getUserResponsibilityCentreName = () => {
    return user?.responsibilityCentre?.descr || user?.responsibilityCenter?.descr || user?.responsibilityCentre?.code || user?.responsibilityCenter?.code || null;
  };

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    docDate: new Date().toISOString().split("T")[0],
    comptableDate: null,
    selectedTypeId: null,
    selectedSubTypeId: null,
    title: "",
    documentAlias: "",
    content: "",
    circuitId: null,
    circuitName: "",
    isExternal: false,
    externalReference: "",
    responsibilityCentreId: getUserResponsibilityCentreId(),
    // Customer/Vendor fields
    selectedCustomerVendor: null,
    customerVendorName: "",
    customerVendorAddress: "",
    customerVendorCity: "",
    customerVendorCountry: "",
  });

  // Data fetching states
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [circuits, setCircuits] = useState<any[]>([]);
  const [responsibilityCentres, setResponsibilityCentres] = useState<
    ResponsibilityCentreSimple[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validation errors
  const [dateError, setDateError] = useState<string | null>(null);
  const [comptableDateError, setComptableDateError] = useState<string | null>(
    null
  );
  const [typeError, setTypeError] = useState<string | null>(null);
  const [subTypeError, setSubTypeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [circuitError, setCircuitError] = useState<string | null>(null);
  const [responsibilityCentreError, setResponsibilityCentreError] = useState<
    string | null
  >(null);

  // Define if we need to show responsibility centre step (now always true as it's the first step)
  const shouldShowResponsibilityCentreStep = true;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);

      // Start with no responsibility center
      const initialFormData = {
        docDate: new Date().toISOString().split("T")[0],
        comptableDate: null,
        selectedTypeId: null,
        selectedSubTypeId: null,
        title: "",
        documentAlias: "",
        content: "",
        circuitId: null,
        circuitName: "",
        isExternal: false,
        externalReference: "",
        responsibilityCentreId: null,
        // Customer/Vendor fields
        selectedCustomerVendor: null,
        customerVendorName: "",
        customerVendorAddress: "",
        customerVendorCity: "",
        customerVendorCountry: "",
      };

      setFormData(initialFormData);
      setIsLoading(true);

      // Check if user has a responsibility center from auth context first
      if (userHasResponsibilityCentre) {
        console.log("User has responsibility centre from auth context:", {
          id: getUserResponsibilityCentreId(),
          name: getUserResponsibilityCentreName()
        });
        // User has a responsibility center, use it immediately
        setFormData((prev) => ({
          ...prev,
          responsibilityCentreId: getUserResponsibilityCentreId(),
        }));
        setIsLoading(false);
      } else {
        // User doesn't have an assigned center in context, check API and fetch available centers
        api
          .get("/Account/user-info")
          .then((response) => {
            console.log("User info from API:", response.data);
            // API uses both "responsibilityCenter" and "responsibilityCentre"
            const responsibilityCentreId = response.data?.responsibilityCenter?.id || response.data?.responsibilityCentre?.id;
            if (responsibilityCentreId) {
              console.log(
                "Found responsibility center in API user data:",
                response.data.responsibilityCenter || response.data.responsibilityCentre
              );
              // User has a responsibility center, use it
              setFormData((prev) => ({
                ...prev,
                responsibilityCentreId: responsibilityCentreId,
              }));
              setIsLoading(false);
            } else {
              // User doesn't have an assigned center, fetch available centers
              fetchResponsibilityCentres();
            }
          })
          .catch((error) => {
            console.error("Failed to fetch user info:", error);
            // Try to fetch responsibility centres anyway
            fetchResponsibilityCentres();
          });
      }

      // Fetch other required data
      fetchDocumentTypes();
      fetchCircuits();
    }
  }, [open]);

  // Step definitions
  // Responsibility Centre is now the first step for all users
  const baseSteps: Step[] = [
    {
      id: 1,
      title: t("documents.responsibilityCentre"),
      description: t("documents.selectResponsibilityCentre"),
      icon: <Building2 className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: t("documents.documentDate"),
      description: t("documents.selectDocumentDate"),
      icon: <Calendar className="h-4 w-4" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: t("common.type"),
      description: t("documents.selectTypeAndSeries"),
      icon: <Layers className="h-4 w-4" />,
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: t("documents.customerVendor"),
      description: t("documents.selectCustomerOrVendor"),
      icon: <Building2 className="h-4 w-4" />,
      completed: currentStep > 4,
    },
    {
      id: 5,
      title: t("documents.content"),
      description: t("documents.addDocumentContent"),
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 5,
    },
  ];

  // Circuit step and review step
  const circuitStep: Step = {
    id: 6,
    title: t("documents.circuitOptional"),
    description: t("documents.assignToWorkflowOrSkip"),
    icon: <Share2 className="h-4 w-4" />,
    completed: currentStep > 6,
  };

  const reviewStep: Step = {
    id: 7,
    title: t("documents.review"),
    description: t("documents.confirmDocumentDetails"),
    icon: <CheckCircle className="h-4 w-4" />,
    completed: false,
  };

  // Create final steps array
  const steps: Step[] = [...baseSteps, circuitStep, reviewStep];

  const TOTAL_STEPS = steps.length;

  const fetchDocumentTypes = async () => {
    try {
      setIsLoading(true);
      const types = await documentTypeService.getAllDocumentTypes();

      if (types && types.length > 0) {
        setDocumentTypes(types);
      } else {
        toast.warning("No document types found", {
          description:
            "You need to create document types before creating documents.",
          duration: 5000,
        });
        setDocumentTypes([]);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
      toast.error("Failed to load document types", {
        description:
          "There was a problem loading document types. Using fallback data.",
        duration: 4000,
      });

      // Set some default document types as fallback
      setDocumentTypes([
        { id: 1, typeName: "Invoice", typeKey: "INV" },
        { id: 2, typeName: "Contract", typeKey: "CON" },
        { id: 3, typeName: "Report", typeKey: "REP" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCircuits = async () => {
    try {
      setIsLoading(true);

      // Use the circuit service to get all circuits with document type information
      const allCircuits = await circuitService.getAllCircuits();

      // Transform the API response to match our interface and filter by active status
      const activeCircuits = allCircuits
        .filter((circuit) => circuit.isActive)
        .map((circuit) => ({
          id: circuit.id,
          name: circuit.title,
          code: circuit.circuitKey,
          description: circuit.descriptif || circuit.title,
          isActive: circuit.isActive,
          documentTypeId: circuit.documentTypeId, // Add document type ID for filtering
          documentType: circuit.documentType, // Add document type info for reference
        }));

      console.log("Active circuits from API:", activeCircuits);
      setCircuits(activeCircuits);
    } catch (error) {
      console.error("Failed to fetch active circuits:", error);
      toast.error("Failed to load circuits", {
        description:
          "There was a problem loading active circuits from the server.",
        duration: 4000,
      });
      // Set empty array instead of mock data
      setCircuits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubTypesForDate = async (typeId: number, date: string) => {
    try {
      setIsLoading(true);
      const dateObj = new Date(date);

      // Try to get subtypes from API that are valid for the selected date
      const subtypes = await subTypeService.getSubTypesForDate(typeId, dateObj);

      if (subtypes && subtypes.length > 0) {
        setSubTypes(subtypes);
        return;
      }

      // If we get here, no valid subtypes were found for this date
      setSubTypes([]);

      // Get the type name for better error message
      const typeName =
        documentTypes.find((t) => t.id === typeId)?.typeName || "selected type";

      toast.warning(`No valid subtypes available`, {
        description: `There are no subtypes available for "${typeName}" on ${new Date(
          date
        ).toLocaleDateString()}. Please select a different document type or date.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Failed to fetch subtypes:", error);
      toast.error("Failed to load subtypes", {
        description:
          "There was a problem loading subtypes for the selected date. Using fallback data.",
        duration: 4000,
      });

      // Use fallback subtypes filtered by date
      const fallbackSubtypes = getFallbackSubtypes(typeId, date);

      if (fallbackSubtypes.length === 0) {
        // Get the type name for better error message
        const typeName =
          documentTypes.find((t) => t.id === typeId)?.typeName ||
          "selected type";

        toast.warning(`No valid subtypes available`, {
          description: `There are no subtypes available for "${typeName}" on ${new Date(
            date
          ).toLocaleDateString()}. Please select a different document type or date.`,
          duration: 5000,
        });
      }

      setSubTypes(fallbackSubtypes);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback subtypes function
  const getFallbackSubtypes = (
    typeId: number,
    selectedDate?: string
  ): SubType[] => {
    const fallbackData: Record<number, SubType[]> = {
      1: [
        // For Invoice
        {
          id: 101,
          name: "Standard Invoice",
          subTypeKey: "SI",
          description: "Standard invoice for regular billing",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 1,
          isActive: true,
        },
        {
          id: 102,
          name: "Tax Invoice",
          subTypeKey: "TI",
          description: "Invoice with tax details included",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 1,
          isActive: true,
        },
      ],
      2: [
        // For Contract
        {
          id: 201,
          name: "Employment Contract",
          subTypeKey: "EC",
          description: "Contract for employment purposes",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 2,
          isActive: true,
        },
        {
          id: 202,
          name: "Service Agreement",
          subTypeKey: "SA",
          description: "Agreement for service provision",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 2,
          isActive: true,
        },
      ],
      3: [
        // For Report
        {
          id: 301,
          name: "Monthly Report",
          subTypeKey: "MR",
          description: "Regular monthly reporting document",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 3,
          isActive: true,
        },
        {
          id: 302,
          name: "Annual Report",
          subTypeKey: "AR",
          description: "Yearly comprehensive report",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 3,
          isActive: true,
        },
      ],
    };

    // Get all subtypes for the type
    const allSubtypes = fallbackData[typeId] || [];

    // If no date provided, return all subtypes
    if (!selectedDate) {
      return allSubtypes;
    }

    // Filter subtypes based on date range
    const docDate = new Date(selectedDate);
    docDate.setHours(0, 0, 0, 0); // Normalize time
    
    return allSubtypes.filter((subtype) => {
      const startDate = new Date(subtype.startDate);
      const endDate = new Date(subtype.endDate);
      
      // Normalize dates to avoid timezone issues
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const isValid = docDate >= startDate && docDate <= endDate;
      
      console.log(`[DEBUG] Fallback filter - ${subtype.subTypeKey}: docDate=${docDate.toISOString()}, start=${startDate.toISOString()}, end=${endDate.toISOString()}, valid=${isValid}`);
      
      // Check if document date falls within the subtype's valid date range
      return isValid;
    });
  };

  const handleUpdateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors when a field changes
    if (field === "docDate") setDateError(null);
    if (field === "selectedTypeId") setTypeError(null);
    if (field === "selectedSubTypeId") setSubTypeError(null);
    if (field === "title") setTitleError(null);
    if (field === "content") setContentError(null);

    // If document date changes, reset type and subtype selections
    if (field === "docDate") {
      setFormData((prev) => ({
        ...prev,
        selectedTypeId: null,
        selectedSubTypeId: null,
      }));
    }

    // If document type changes, reset subtype selection and fetch valid subtypes
    if (field === "selectedTypeId" && value !== null) {
      setFormData((prev) => ({
        ...prev,
        selectedSubTypeId: null,
      }));
      fetchSubTypesForDate(value, formData.docDate);
    }
  };

  const validateDateStep = () => {
    if (!formData.docDate) {
      setDateError("Document date is required");
      toast.error("Document date is required", {
        description: "Please select a valid date to continue.",
        duration: 3000,
      });
      return false;
    }

    try {
      // Validate date format
      const dateObj = new Date(formData.docDate);
      if (isNaN(dateObj.getTime())) {
        setDateError("Invalid date format");
        toast.error("Invalid date format", {
          description: "Please select a valid date to continue.",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      setDateError("Invalid date");
      toast.error("Invalid date", {
        description: "Please select a valid date to continue.",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const validateTypeStep = () => {
    if (!formData.selectedTypeId) {
      setTypeError("Document type is required");
      toast.error("Document type is required", {
        description: "Please select a document type to continue.",
        duration: 3000,
      });
      return false;
    }

    if (!formData.selectedSubTypeId) {
      setSubTypeError("Subtype is required");
      toast.error("Subtype is required", {
        description: "Please select a subtype to continue.",
        duration: 3000,
      });
      return false;
    }

    // Validate that the selected subtype is valid for the selected date
    const selectedSubType = subTypes.find(
      (st) => st.id === formData.selectedSubTypeId
    );
    if (!selectedSubType) {
      setSubTypeError("Invalid subtype selection");
      toast.error("Invalid subtype selection", {
        description:
          "The selected subtype is not valid. Please select a valid subtype.",
        duration: 3000,
      });
      return false;
    }

    // Additional validation to ensure the subtype is valid for the selected date
    try {
      const docDate = new Date(formData.docDate);
      const startDate = new Date(selectedSubType.startDate);
      const endDate = new Date(selectedSubType.endDate);

      // Normalize dates to avoid timezone issues
      docDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      console.log('[DEBUG] Date validation:', {
        docDate: docDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isValid: docDate >= startDate && docDate <= endDate
      });

      if (docDate < startDate || docDate > endDate) {
        setSubTypeError("Subtype not valid for selected date");
        // Remove duplicate toast - this validation is also called elsewhere
        console.log('[DEBUG] Date validation failed in wizard');
        return false;
      }
    } catch (error) {
      console.error("Error validating subtype date range:", error);
    }

    return true;
  };

  const validateContentStep = () => {
    if (!formData.content.trim()) {
      setContentError(t("documents.documentContentRequired"));
      toast.error(t("documents.documentContentRequired"), {
        description: t("documents.pleaseEnterContentToContinue"),
        duration: 3000,
      });
      return false;
    }

    // If we haven't set a title yet, derive it from the content
    if (!formData.title.trim()) {
      // Get the first line or first few words as the title
      const firstLine = formData.content.split("\n")[0].trim();
      const title =
        firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
      handleUpdateFormData("title", title);
    }

    return true;
  };

  const validateCircuitStep = () => {
    // Circuit selection is optional
    // Just check if there are active circuits available to show, but don't require selection
    const activeCircuits = circuits.filter((c) => c.isActive);
    if (activeCircuits.length === 0) {
      setCircuitError("No active circuits available for assignment");
      toast.error("No active circuits available", {
        description:
          "There are no active circuits available. You can continue without assigning a circuit or create active circuits first.",
        duration: 5000,
      });
      // Still return true since circuit assignment is optional
      return true;
    }
    return true;
  };

  const validateResponsibilityCentreStep = (): boolean => {
    // Clear previous error
    setResponsibilityCentreError(null);

    // Auto-pass for users with assigned centers
    if (formData.responsibilityCentreId) {
      return true;
    }

    // Require a responsibility centre selection for users without an assigned center
    setResponsibilityCentreError(t("documents.pleaseSelectResponsibilityCentre"));
    toast.error(t("documents.responsibilityCentreRequired"), {
      description: t("documents.pleaseSelectResponsibilityCentreToContinue"),
      duration: 3000,
    });
    return false;
  };

  const validateCustomerVendorStep = (): boolean => {
    // Get the selected document type
    const selectedType = documentTypes.find(t => t.id === formData.selectedTypeId);
    
    // If document type requires customer or vendor
    if (selectedType?.tierType === 1 || selectedType?.tierType === 2) { // Customer = 1, Vendor = 2
      if (!formData.selectedCustomerVendor) {
        const tierName = selectedType.tierType === 1 ? 'customer' : 'vendor';
        toast.error(`Please select a ${tierName}`);
        return false;
      }
      if (!formData.customerVendorName.trim()) {
        toast.error("Please enter a name");
        return false;
      }
    }
    return true;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Responsibility Centre
        return validateResponsibilityCentreStep();
      case 2: // Document Date
        return validateDateStep();
      case 3: // Document Type
        return validateTypeStep();
      case 4: // Customer/Vendor
        return validateCustomerVendorStep();
      case 5: // Content
        return validateContentStep();
      case 6: // Circuit
        return validateCircuitStep();
      case 7: // Review
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setIsSubmitting(true);
      toast.loading("Creating document...");

      // Get the selected type and subtype objects
      const selectedType = documentTypes.find(
        (t) => t.id === formData.selectedTypeId
      );
      const selectedSubType = subTypes.find(
        (st) => st.id === formData.selectedSubTypeId
      );

      if (!selectedType || !selectedSubType) {
        toast.dismiss();
        toast.error("Invalid document type or subtype");
        return;
      }

      // Helper function to get the correct code property based on tier type
      const getCustomerVendorCode = (): string | null => {
        if (!formData.selectedCustomerVendor) return null;
        
        // For customers, use 'code' property
        if (selectedType.tierType === 1) { // TierType.Customer = 1
          return formData.selectedCustomerVendor.code || null;
        }
        // For vendors, use 'vendorCode' property
        else if (selectedType.tierType === 2) { // TierType.Vendor = 2
          return formData.selectedCustomerVendor.vendorCode || null;
        }
        
        return null;
      };

      // Prepare the request data
      const requestData = {
        typeId: formData.selectedTypeId!,
        subTypeId: formData.selectedSubTypeId!,
        title: formData.title,
        documentAlias: formData.isExternal ? "" : formData.documentAlias,
        docDate: formData.docDate,
        comptableDate: formData.comptableDate,
        content: formData.content,
        circuitId: formData.circuitId,
        circuitName: formData.circuitName,
        responsibilityCentreId: formData.responsibilityCentreId,
        // Customer/Vendor data - using proper code extraction
        customerVendorCode: getCustomerVendorCode(),
        customerVendorName: formData.customerVendorName || null,
        customerVendorAddress: formData.customerVendorAddress || null,
        customerVendorCity: formData.customerVendorCity || null,
        customerVendorCountry: formData.customerVendorCountry || null,
        ...(formData.isExternal && {
          documentExterne: formData.externalReference,
        }),
      };

      // Call the API to create the document
      const response = await documentService.createDocument(requestData);

      toast.dismiss();
      toast.success("Document created successfully", {
        description: "Redirecting to document view...",
        duration: 3000,
      });

      onSuccess(); // Notify parent component
      onOpenChange(false); // Close dialog

      // Navigate to the document view page with a small delay
      if (response && response.id) {
        setTimeout(() => {
          navigate(`/documents/${response.id}`);
        }, 1000); // 1-second delay for the toast to be visible
      }
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.dismiss();
      toast.error("Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      handleUpdateFormData("docDate", dateString);
    }
  };

  const handleComptableDateChange = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      handleUpdateFormData("comptableDate", dateString);
    } else {
      handleUpdateFormData("comptableDate", null);
    }
  };

  const handleTypeChange = (value: string) => {
    const typeId = value ? parseInt(value, 10) : null;
    handleUpdateFormData("selectedTypeId", typeId);
  };

  const handleSubTypeChange = (value: string) => {
    const subTypeId = value ? parseInt(value, 10) : null;
    handleUpdateFormData("selectedSubTypeId", subTypeId);
  };

  const handleContentChange = (value: string) => {
    handleUpdateFormData("content", value);
  };

  const handleCircuitChange = (value: string) => {
    const circuitId = value ? parseInt(value, 10) : null;
    handleUpdateFormData("circuitId", circuitId);

    // Find the circuit name for the selected ID
    if (circuitId) {
      const selectedCircuit = circuits.find((c) => c.id === circuitId);
      if (selectedCircuit) {
        handleUpdateFormData("circuitName", selectedCircuit.name);
      }
    } else {
      handleUpdateFormData("circuitName", "");
    }
  };

  const handleExternalChange = (value: boolean) => {
    handleUpdateFormData("isExternal", value);
  };

  const handleExternalReferenceChange = (value: string) => {
    handleUpdateFormData("externalReference", value);
  };

  const handleResponsibilityCentreChange = (centreId: number | undefined) => {
    // Only allow changing if user doesn't have an assigned center
    if (!userHasResponsibilityCentre) {
      handleUpdateFormData("responsibilityCentreId", centreId);
    }
    // If user has a responsibility centre, their centre is already set in formData
    // and cannot be changed
  };

  // Customer/Vendor handlers
  const handleCustomerVendorSelect = (customerVendor: any) => {
    handleUpdateFormData("selectedCustomerVendor", customerVendor);
  };

  const handleCustomerVendorNameChange = (name: string) => {
    handleUpdateFormData("customerVendorName", name);
  };

  const handleCustomerVendorAddressChange = (address: string) => {
    handleUpdateFormData("customerVendorAddress", address);
  };

  const handleCustomerVendorCityChange = (city: string) => {
    handleUpdateFormData("customerVendorCity", city);
  };

  const handleCustomerVendorCountryChange = (country: string) => {
    handleUpdateFormData("customerVendorCountry", country);
  };

  const jumpToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Fetch responsibility centers with better error handling
  const fetchResponsibilityCentres = async () => {
    try {
      console.log("CreateDocumentWizard: Fetching responsibility centres");
      setIsLoading(true);

      // Check API connectivity first
      const isApiConnected = await checkApiConnection();
      if (!isApiConnected) {
        console.error(
          "API is not connected - cannot fetch responsibility centres"
        );
        toast.error("Cannot connect to server", {
          description: "Please check your internet connection and try again.",
          duration: 4000,
        });
        setResponsibilityCentres([]);
        return;
      }

      // Try to fetch from the API directly first for more reliable results
      try {
        const response = await api.get("/ResponsibilityCentre/simple");
        const centres = response.data;

        console.log("CreateDocumentWizard: Fetched centres:", centres);

        if (centres && centres.length > 0) {
          setResponsibilityCentres(centres);
        } else {
          console.warn(
            "CreateDocumentWizard: No responsibility centres returned from API"
          );
          toast.error("No responsibility centres available", {
            description:
              "Please contact your administrator to set up responsibility centres.",
            duration: 4000,
          });
          setResponsibilityCentres([]);
        }
      } catch (directApiError) {
        console.error(
          "Direct API call failed, trying service:",
          directApiError
        );

        // Fallback to the service method
        const centres =
          await responsibilityCentreService.getSimpleResponsibilityCentres();
        if (centres && centres.length > 0) {
          setResponsibilityCentres(centres);
        } else {
          setResponsibilityCentres([]);
          toast.error("No responsibility centres available", {
            description:
              "Please contact your administrator to set up responsibility centres.",
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error(
        "CreateDocumentWizard: Failed to fetch responsibility centres:",
        error
      );
      toast.error("Failed to load responsibility centres", {
        description:
          "There was a problem loading responsibility centres. Please try again or contact your administrator.",
        duration: 5000,
      });
      setResponsibilityCentres([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching responsibility centers
  const retryFetchResponsibilityCentres = () => {
    console.log("Retrying to fetch responsibility centres");
    fetchResponsibilityCentres();
  };

  // Get the name of the selected responsibility centre
  const getSelectedResponsibilityCentreName = (): string | undefined => {
    // First check if user has an assigned responsibility centre
    if (userHasResponsibilityCentre) {
      const userCentre = user?.responsibilityCentre || user?.responsibilityCenter;
      if (userCentre) {
        return userCentre.code && userCentre.descr 
          ? `${userCentre.code} - ${userCentre.descr}`
          : userCentre.descr || userCentre.code;
      }
    }
    
    // Otherwise, look up in the available responsibility centres
    const selectedCentre = responsibilityCentres.find(
      (centre) => centre.id === formData.responsibilityCentreId
    );
    return selectedCentre?.code && selectedCentre?.descr
      ? `${selectedCentre.code} - ${selectedCentre.descr}`
      : selectedCentre?.descr;
  };

  const renderStepContent = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    };

    switch (currentStep) {
      case 1: // Responsibility Centre
        return (
          <MotionDiv
            key="step1-rc"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
                          <ResponsibilityCentreStep
              selectedCentreId={formData.responsibilityCentreId || undefined}
              onCentreChange={handleResponsibilityCentreChange}
              userHasCentre={userHasResponsibilityCentre}
              userCentreName={getSelectedResponsibilityCentreName()}
              isLoading={isLoading}
              responsibilityCentres={responsibilityCentres}
              onRetryFetch={retryFetchResponsibilityCentres}
            />
            </div>
          </MotionDiv>
        );

      case 2: // Document Date
        return (
          <MotionDiv
            key="step2-date"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <DateSelectionStep
                docDate={formData.docDate}
                comptableDate={formData.comptableDate}
                dateError={dateError}
                comptableDateError={comptableDateError}
                onDateChange={handleDateChange}
                onComptableDateChange={handleComptableDateChange}
                selectedSubType={subTypes.find(
                  (st) => st.id === formData.selectedSubTypeId
                )}
              />
            </div>
          </MotionDiv>
        );

      case 3: // Document Type & Subtype
        return (
          <MotionDiv
            key="step3-type"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <TypeSelectionWithDateFilterStep
                documentTypes={documentTypes}
                selectedTypeId={formData.selectedTypeId}
                selectedSubTypeId={formData.selectedSubTypeId}
                onTypeChange={handleTypeChange}
                onSubTypeChange={handleSubTypeChange}
                typeError={typeError}
                subTypeError={subTypeError}
                documentDate={formData.docDate}
                jumpToDateStep={() => setCurrentStep(2)}
              />
            </div>
          </MotionDiv>
        );

      case 4: // Customer/Vendor
        return (
          <MotionDiv
            key="step4-customer-vendor"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <CustomerVendorSelectionStep
                selectedTypeId={formData.selectedTypeId}
                documentTypes={documentTypes}
                selectedCustomerVendor={formData.selectedCustomerVendor}
                customerVendorName={formData.customerVendorName}
                customerVendorAddress={formData.customerVendorAddress}
                customerVendorCity={formData.customerVendorCity}
                customerVendorCountry={formData.customerVendorCountry}
                onCustomerVendorSelect={handleCustomerVendorSelect}
                onNameChange={handleCustomerVendorNameChange}
                onAddressChange={handleCustomerVendorAddressChange}
                onCityChange={handleCustomerVendorCityChange}
                onCountryChange={handleCustomerVendorCountryChange}
              />
            </div>
          </MotionDiv>
        );

      case 5: // Content
        return (
          <MotionDiv
            key="step5-content"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <ContentStep
                content={formData.content}
                onContentChange={handleContentChange}
                contentError={contentError}
                isExternal={formData.isExternal}
                onExternalChange={handleExternalChange}
                externalReference={formData.externalReference}
                onExternalReferenceChange={handleExternalReferenceChange}
              />
            </div>
          </MotionDiv>
        );

      case 6: // Circuit
        return (
          <MotionDiv
            key="step6-circuit"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <CircuitAssignmentStep
                circuits={circuits
                  .filter((circuit) => {
                    // Filter by active status
                    if (!circuit.isActive) return false;

                    // Filter by document type - only show circuits that match the selected document type
                    // If circuit has no documentTypeId, it can be used with any document type (for backward compatibility)
                    // If formData.selectedTypeId is null, don't filter by type yet
                    if (formData.selectedTypeId && circuit.documentTypeId) {
                      return circuit.documentTypeId === formData.selectedTypeId;
                    }

                    // If circuit has no specific document type, allow it for any document type
                    return !circuit.documentTypeId;
                  })
                  .map((circuit) => ({
                    ...circuit,
                  }))}
                selectedCircuitId={formData.circuitId}
                circuitError={circuitError}
                onCircuitChange={handleCircuitChange}
                isLoading={isLoading}
              />
            </div>
          </MotionDiv>
        );

      case 7: // Review
        return (
          <MotionDiv
            key="step7-review"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <ReviewStep
                selectedType={documentTypes.find(
                  (t) => t.id === formData.selectedTypeId
                )}
                selectedSubType={subTypes.find(
                  (st) => st.id === formData.selectedSubTypeId
                )}
                documentAlias={formData.documentAlias}
                title={formData.title}
                docDate={formData.docDate}
                comptableDate={formData.comptableDate}
                content={formData.content}
                circuitName={formData.circuitName}
                isExternal={formData.isExternal}
                externalReference={formData.externalReference}
                responsibilityCentreName={getSelectedResponsibilityCentreName()}
                userHasAssignedCentre={userHasResponsibilityCentre}
                selectedCustomerVendor={formData.selectedCustomerVendor}
                customerVendorName={formData.customerVendorName}
                customerVendorAddress={formData.customerVendorAddress}
                customerVendorCity={formData.customerVendorCity}
                customerVendorCountry={formData.customerVendorCountry}
                onEditTypeClick={() => jumpToStep(3)}
                onEditDetailsClick={() => jumpToStep(5)} // Updated to point to Content step
                onEditDateClick={() => jumpToStep(2)}
                onEditContentClick={() => jumpToStep(5)} // Updated to point to Content step
                onEditCircuitClick={() => jumpToStep(6)} // Updated to point to Circuit step
                onEditCustomerVendorClick={() => jumpToStep(4)} // Point to Customer/Vendor step
                onEditResponsibilityCentreClick={
                  userHasResponsibilityCentre ? undefined : () => jumpToStep(1)
                }
              />
            </div>
          </MotionDiv>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-[#0a1033] border border-blue-900/30 flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl text-blue-100">
            {currentStep === 1
                              ? t("documents.responsibilityCentre")
              : currentStep === 2
              ? t("documents.documentDate")
              : currentStep === 3
              ? t("common.type")
              : currentStep === 4
              ? t("documents.documentContent")
              : currentStep === 5
              ? t("documents.circuitAssignmentOptional")
              : t("documents.reviewDocument")}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            {currentStep === 1
              ? userHasResponsibilityCentre
                ? t("documents.documentWillBeAssignedToYourCentre")
                : t("documents.selectResponsibilityCentreForDocument")
              : currentStep === 2
              ? t("documents.selectDocumentDate")
              : currentStep === 3
              ? t("documents.selectDocumentTypeAndSubtype")
              : currentStep === 4
              ? t("documents.addContentForDocument")
              : currentStep === 5
              ? t("documents.assignCircuitOrSkipToCreateStatic")
              : t("documents.confirmDocumentDetailsBeforeCreation")}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-4 mt-2 flex-shrink-0">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2",
                    step.id === currentStep
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : step.completed
                      ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500"
                      : "border-gray-300 text-gray-500 dark:border-gray-700"
                  )}
                >
                  {step.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon || step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    step.id === currentStep
                      ? "text-blue-600 dark:text-blue-500"
                      : step.completed
                      ? "text-green-600 dark:text-green-500"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 hidden sm:block",
                    step.id === currentStep &&
                      "text-blue-600 dark:text-blue-500"
                  )}
                >
                  {step.description}
                </span>
              </div>
            ))}
          </div>

          {/* Progress line */}
          <div className="relative mt-4 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div
                className="h-1 bg-blue-600 dark:bg-blue-500 rounded transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content - Scrollable */}
        <div className="py-2 flex-grow overflow-y-auto min-h-0">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex justify-between mt-4 flex-shrink-0">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.back")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
            >
              <X className="mr-2 h-4 w-4" />
              {t("common.cancel")}
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("common.next")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                                  {isSubmitting ? (
                  <>
                    <div className="spinner mr-2" /> {t("documents.creating")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> {t("documents.createDocument")}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
