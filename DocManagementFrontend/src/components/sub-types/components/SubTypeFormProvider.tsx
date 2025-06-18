import React, { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DocumentType } from "@/models/document";
import { CreateSubTypeDto } from "@/models/subtype";
import subTypeService from "@/services/subTypeService";
import { useNavigate } from "react-router-dom";

interface SubTypeFormData {
  name?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  isActive?: boolean;
  documentTypeId?: number;
  id?: number; // Added ID for edit cases
}

interface SubTypeFormContextType {
  formData: SubTypeFormData;
  updateForm: (data: Partial<SubTypeFormData>) => void;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  handleSubmit: () => void;
  setHandleSubmit: (cb: () => void) => void;
  validateCurrentStep: () => Promise<boolean>;
  isLoading: boolean;
}

const SubTypeFormContext = createContext<SubTypeFormContextType | undefined>(
  undefined
);

interface SubTypeFormProviderProps {
  onSubmit: (data: SubTypeFormData) => void;
  onClose: () => void;
  children: React.ReactNode;
  initialData?: SubTypeFormData;
  documentTypes?: DocumentType[];
}

export const SubTypeFormProvider = ({
  onSubmit,
  onClose,
  children,
  initialData = {},
  documentTypes = [],
}: SubTypeFormProviderProps) => {
  const [formData, setFormData] = useState<SubTypeFormData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitHandler, setSubmitHandler] = useState<() => void>(() => {});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const updateForm = (data: Partial<SubTypeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      // Date step validation
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required";
        isValid = false;
      }

      if (!formData.endDate) {
        newErrors.endDate = "End date is required";
        isValid = false;
      }

      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (endDate < startDate) {
          newErrors.endDate = "End date must be after start date";
          isValid = false;
        }

        // Only check for overlaps if we have a document type ID and valid date range
        if (isValid && formData.documentTypeId) {
          setIsLoading(true);
          try {
            const { overlapping, overlappingWith } =
              await subTypeService.checkOverlappingDateIntervals(
                formData.documentTypeId,
                formData.startDate,
                formData.endDate,
                formData.id // Pass ID for edit cases
              );

            if (overlapping && overlappingWith) {
              newErrors.startDate = `Date range overlaps with existing series: ${overlappingWith.name}`;
              isValid = false;
              toast.toast({
                title: "Date Overlap Detected",
                description: `Your selected date range overlaps with an existing series: ${overlappingWith.name}`,
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error checking date overlaps:", error);
            toast.toast({
              title: "Warning",
              description:
                "Could not verify date range overlap. You may proceed, but be cautious.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        }
      }
    } else if (currentStep === 2) {
      // Basic info validation (prefix) - prefix is optional
      if (formData.name && formData.name.trim().length > 0) {
        // Only validate if user has entered a prefix
        if (formData.name.trim().length < 2) {
          newErrors.name = "Prefix must be at least 2 characters long";
          isValid = false;
        } else if (!/^[A-Za-z0-9\-_]+$/.test(formData.name.trim())) {
          newErrors.name = "Prefix can only contain letters, numbers, hyphens, and underscores";
          isValid = false;
        } else {
          // Check prefix uniqueness if we have a document type ID
          if (formData.documentTypeId) {
            setIsLoading(true);
            try {
              const isUnique = await subTypeService.validatePrefix(
                formData.name.trim(),
                formData.documentTypeId,
                formData.id // Pass ID for edit cases
              );

              if (!isUnique) {
                newErrors.name = "This prefix is already used by another series for this document type";
                isValid = false;
                toast.toast({
                  title: "Prefix Already Exists",
                  description: "This prefix is already used by another series. Please choose a different prefix.",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Error validating prefix:", error);
              newErrors.name = "Could not validate prefix uniqueness. Please try again.";
              isValid = false;
              toast.toast({
                title: "Validation Error",
                description: "Could not verify prefix uniqueness. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
      // If no prefix is provided, it will be auto-generated by the backend

      // Apply defaults for dates if they're still not set
      if (!formData.startDate) {
        updateForm({ startDate: new Date().toISOString().split("T")[0] });
      }

      if (!formData.endDate) {
        updateForm({
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          )
            .toISOString()
            .split("T")[0],
        });
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = async () => {
    setIsLoading(true);
    const isValid = await validateCurrentStep();
    setIsLoading(false);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Final validation before submitting
    if (currentStep === 3) {
      // Apply defaults for any missing required fields
      const finalData = { ...formData };

      if (!finalData.startDate) {
        finalData.startDate = new Date().toISOString().split("T")[0];
      }

      if (!finalData.endDate) {
        finalData.endDate = new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        )
          .toISOString()
          .split("T")[0];
      }

      if (finalData.isActive === undefined) {
        finalData.isActive = true;
      }

      onSubmit(finalData);
    } else {
      submitHandler();
    }
  };

  return (
    <SubTypeFormContext.Provider
      value={{
        formData,
        updateForm,
        currentStep,
        nextStep,
        prevStep,
        errors,
        setErrors,
        handleSubmit,
        setHandleSubmit: setSubmitHandler,
        validateCurrentStep,
        isLoading,
      }}
    >
      {children}
    </SubTypeFormContext.Provider>
  );
};

export const useSubTypeForm = () => {
  const context = useContext(SubTypeFormContext);
  if (!context) {
    throw new Error("useSubTypeForm must be used within a SubTypeFormProvider");
  }
  return context;
};
