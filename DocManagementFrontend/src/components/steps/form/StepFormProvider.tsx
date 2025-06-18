import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import stepService from "@/services/stepService";
import { Step } from "@/models/step";
import api from "@/services/api/core";
import approvalService from "@/services/approvalService";

// Step form interface
interface StepFormData {
  title: string;
  descriptif: string;
  orderIndex: number;
  circuitId: number;
  responsibleRoleId?: number;
  isFinalStep: boolean;
  requiresApproval: boolean;
  approvalType?: "user" | "group";
  approvalUserId?: number;
  approvalGroupId?: number;
  currentStatusId?: number;
  nextStatusId?: number;
}

// Interface for registered step forms
interface StepFormRegistration {
  validate: () => Promise<boolean>;
  getValues: () => any;
}

interface StepFormContextType {
  currentStep: number;
  formData: StepFormData;
  setFormData: (data: Partial<StepFormData>) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  submitForm: () => Promise<boolean>;
  isSubmitting: boolean;
  isEditMode: boolean;
  stepId?: number;
  totalSteps: number;
  validateCurrentStep: () => Promise<boolean>;
  registerStepForm: (stepNumber: number, form: StepFormRegistration) => void;
  formErrors: Record<number, string[]>;
}

const initialFormData: StepFormData = {
  title: "",
  descriptif: "",
  orderIndex: 10,
  circuitId: 0,
  responsibleRoleId: undefined,
  isFinalStep: false,
  requiresApproval: false,
  approvalType: undefined,
  approvalUserId: undefined,
  approvalGroupId: undefined,
  currentStatusId: undefined,
  nextStatusId: undefined,
};

const StepFormContext = createContext<StepFormContextType | undefined>(
  undefined
);

export const useStepForm = () => {
  const context = useContext(StepFormContext);
  if (!context) {
    throw new Error("useStepForm must be used within a StepFormProvider");
  }
  return context;
};

interface StepFormProviderProps {
  children: React.ReactNode;
  editStep?: Step;
  onSuccess?: () => void;
  circuitId?: number;
}

export const StepFormProvider: React.FC<StepFormProviderProps> = ({
  children,
  editStep,
  onSuccess,
  circuitId: propCircuitId,
}) => {
  const navigate = useNavigate();
  const { circuitId: urlCircuitId } = useParams<{ circuitId: string }>();

  // Determine if we're within a circuit context (either from props or URL params)
  const contextCircuitId =
    propCircuitId || (urlCircuitId ? parseInt(urlCircuitId, 10) : undefined);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormDataState] = useState<StepFormData>(() => {
    if (editStep) {
      return {
        title: editStep.title,
        descriptif: editStep.descriptif,
        orderIndex: editStep.orderIndex,
        circuitId: editStep.circuitId,
        responsibleRoleId: editStep.responsibleRoleId,
        isFinalStep: editStep.isFinalStep,
        requiresApproval: editStep.requiresApproval || false,
        approvalType: editStep.approvalGroupId
          ? "group"
          : editStep.approvalUserId
          ? "user"
          : undefined,
        approvalUserId: editStep.approvalUserId,
        approvalGroupId: editStep.approvalGroupId,
        currentStatusId: editStep.currentStatusId,
        nextStatusId: editStep.nextStatusId,
      };
    }

    // If we have a circuit context, pre-fill the circuitId
    if (contextCircuitId) {
      return {
        ...initialFormData,
        circuitId: contextCircuitId,
      };
    }

    return initialFormData;
  });

  // Store form errors by step number
  const [formErrors, setFormErrors] = useState<Record<number, string[]>>({});

  // Store registered form components
  const [registeredForms, setRegisteredForms] = useState<
    Record<number, StepFormRegistration>
  >({});

  // We now have a 4-step process
  const totalSteps = 4;

  const isEditMode = !!editStep;

  const setFormData = (data: Partial<StepFormData>) => {
    console.log("Updating form data:", data);
    setFormDataState((prev) => {
      const newState = { ...prev, ...data };
      console.log("New form state:", newState);
      return newState;
    });
  };

  // Register a form component for a specific step
  const registerStepForm = useCallback((stepNumber: number, form: StepFormRegistration) => {
    setRegisteredForms((prev) => ({
      ...prev,
      [stepNumber]: form,
    }));
  }, []);

  const nextStep = async () => {
    // Validate the current step using the registered form if available
    if (registeredForms[currentStep]) {
      const isValid = await registeredForms[currentStep].validate();
      if (!isValid) {
        return;
      }
    }

    // If we're moving from step 2 (status selection) to step 3,
    // verify that the statuses don't already exist in another step
    if (
      currentStep === 2 &&
      !isEditMode &&
      formData.currentStatusId &&
      formData.nextStatusId
    ) {
      try {
        // Use the dedicated service function
        const exists = await stepService.checkStepExists(
          formData.circuitId,
          formData.currentStatusId,
          formData.nextStatusId
        );

        if (exists) {
          // Found a duplicate, prevent navigation
          setFormErrors((prev) => ({
            ...prev,
            2: [
              ...(prev[2] || []),
              "A step with these status transitions already exists. Please choose different statuses.",
            ],
          }));
          return;
        }
      } catch (error) {
        console.error("Error checking step existence:", error);
        // Continue if the check fails to not block the user
      }
    }

    // Clear errors for the current step when moving forward
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentStep];
      return newErrors;
    });

    // If all checks pass, proceed to the next step
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const prevStep = () => {
    // Clear errors for the current step when moving backward
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentStep];
      return newErrors;
    });

    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormDataState(initialFormData);
    setFormErrors({});
  };

  const submitForm = async (): Promise<boolean> => {
    setFormErrors({});

    // Validate all steps before submission
    const allValid = await validateAllSteps();
    if (!allValid) {
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data with approval settings and map to API field names
      let approvatorId = undefined;
      
      // If using individual user approval, we need to convert userId to approvatorId
      if (formData.approvalType === "user" && formData.approvalUserId) {
        try {
          // Fetch all approvators to find the one with matching userId
          const approvators = await approvalService.getAllApprovators();
          const matchingApprovator = approvators.find(a => a.userId === formData.approvalUserId);
          
          if (!matchingApprovator) {
            setFormErrors((prev) => ({
              ...prev,
              4: [
                ...(prev[4] || []),
                "Selected approver not found in the approvators table. Please ensure the user is configured as an approver.",
              ],
            }));
            return false;
          }
          
          approvatorId = matchingApprovator.id; // Use the approvator ID, not the user ID
        } catch (error) {
          console.error("Error fetching approvators:", error);
          setFormErrors((prev) => ({
            ...prev,
            4: [
              ...(prev[4] || []),
              "Failed to validate approver. Please try again.",
            ],
          }));
          return false;
        }
      }

      const stepData = {
        title: formData.title,
        descriptif: formData.descriptif,
        orderIndex: formData.orderIndex,
        circuitId: formData.circuitId,
        responsibleRoleId: formData.responsibleRoleId,
        isFinalStep: formData.isFinalStep,
        requiresApproval: formData.requiresApproval,

        // Map to API field names with correct IDs
        approvatorId: approvatorId, // Now using the correct approvator ID
        approvatorsGroupId:
          formData.approvalType === "group"
            ? formData.approvalGroupId
            : undefined,

        currentStatusId: formData.currentStatusId,
        nextStatusId: formData.nextStatusId,
      };

      // Final validation check for duplicate steps before submitting
      if (!isEditMode && formData.currentStatusId && formData.nextStatusId) {
        try {
          // Use the dedicated service function
          const exists = await stepService.checkStepExists(
            formData.circuitId,
            formData.currentStatusId,
            formData.nextStatusId
          );

          if (exists) {
            // A duplicate was found at submission time
            setFormErrors((prev) => ({
              ...prev,
              4: [
                ...(prev[4] || []),
                "A step with these status transitions already exists. Please go back to Status Selection and choose different statuses.",
              ],
            }));
            return false;
          }
        } catch (error) {
          console.error(
            "Error checking step existence during submission:",
            error
          );
          // Continue with submission if the check fails
        }
      }

      if (isEditMode && editStep) {
        const success = await stepService.updateStep(editStep.id, stepData);

        if (success) {
          toast.success("Step updated successfully");
          if (onSuccess) onSuccess();
          return true;
        }
      } else {
        const createdStep = await stepService.createStep(stepData);

        if (createdStep) {
          toast.success("Step created successfully");
          if (onSuccess) onSuccess();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error saving step:", error);

      // Check if the error is related to duplicate steps
      const errorMessage = (error as any)?.response?.data?.message || "";
      if (
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.toLowerCase().includes("already exists")
      ) {
        setFormErrors((prev) => ({
          ...prev,
          4: [
            ...(prev[4] || []),
            "A step with these status transitions already exists. Please go back to Status Selection and choose different statuses.",
          ],
        }));
      } else {
        toast.error(
          isEditMode ? "Failed to update step" : "Failed to create step"
        );
      }

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate the current step
  const validateCurrentStep = async (): Promise<boolean> => {
    // Clear any previous errors for the current step
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentStep];
      return newErrors;
    });

    // First, validate using the registered form if available
    if (registeredForms[currentStep]) {
      const isValid = await registeredForms[currentStep].validate();
      if (!isValid) {
        return false;
      }
    }

    // Then apply our custom validation logic
    switch (currentStep) {
      case 1: // Basic Information
        if (!formData.title.trim()) {
          setFormErrors((prev) => ({
            ...prev,
            1: [...(prev[1] || []), "Step title is required"],
          }));
          return false;
        }
        if (!formData.circuitId) {
          setFormErrors((prev) => ({
            ...prev,
            1: [...(prev[1] || []), "Circuit is required"],
          }));
          return false;
        }
        return true;

      case 2: // Status Selection
        if (!formData.currentStatusId) {
          setFormErrors((prev) => ({
            ...prev,
            2: [...(prev[2] || []), "Current status is required"],
          }));
          return false;
        }
        if (!formData.nextStatusId) {
          setFormErrors((prev) => ({
            ...prev,
            2: [...(prev[2] || []), "Next status is required"],
          }));
          return false;
        }

        // Check for duplicate step only if we're creating a new step
        if (
          !isEditMode &&
          formData.circuitId &&
          formData.currentStatusId &&
          formData.nextStatusId
        ) {
          try {
            const exists = await stepService.checkStepExists(
              formData.circuitId,
              formData.currentStatusId,
              formData.nextStatusId
            );

            if (exists) {
              setFormErrors((prev) => ({
                ...prev,
                2: [
                  ...(prev[2] || []),
                  "A step with this status transition already exists",
                ],
              }));
              return false;
            }
          } catch (error) {
            console.error("Error checking step existence:", error);
            // Don't fail validation if the check fails
          }
        }

        return true;

      case 3: // Options
        if (formData.requiresApproval) {
          if (!formData.approvalType) {
            setFormErrors((prev) => ({
              ...prev,
              3: [...(prev[3] || []), "Please select an approval type"],
            }));
            return false;
          }
          if (formData.approvalType === "user" && !formData.approvalUserId) {
            setFormErrors((prev) => ({
              ...prev,
              3: [...(prev[3] || []), "Please select an approver"],
            }));
            return false;
          }
          if (formData.approvalType === "group" && !formData.approvalGroupId) {
            setFormErrors((prev) => ({
              ...prev,
              3: [...(prev[3] || []), "Please select an approval group"],
            }));
            return false;
          }
        }
        return true;
      case 4: // Review
        return true;
      default:
        return true;
    }
  };

  // Add validateAllSteps function
  const validateAllSteps = async (): Promise<boolean> => {
    let allValid = true;
    const newErrors: Record<number, string[]> = {};

    // Validate each step without changing the current step
    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors: string[] = [];

      // Call registered form validation if available
      if (registeredForms[step]) {
        try {
          const isStepValid = await registeredForms[step].validate();
          if (!isStepValid) {
            allValid = false;
            // The registered form should have set its own errors
          }
        } catch (error) {
          allValid = false;
          stepErrors.push(`Validation error on step ${step}`);
        }
      }

      // Apply custom validation logic for each step
      switch (step) {
        case 1: // Basic Information
          if (!formData.title.trim()) {
            stepErrors.push("Step title is required");
            allValid = false;
          }
          if (!formData.circuitId) {
            stepErrors.push("Circuit is required");
            allValid = false;
          }
          break;

        case 2: // Status Selection
          if (!formData.currentStatusId) {
            stepErrors.push("Current status is required");
            allValid = false;
          }
          if (!formData.nextStatusId) {
            stepErrors.push("Next status is required");
            allValid = false;
          }

          // Check for duplicate step only if we're creating a new step
          if (
            !isEditMode &&
            formData.circuitId &&
            formData.currentStatusId &&
            formData.nextStatusId
          ) {
            try {
              const exists = await stepService.checkStepExists(
                formData.circuitId,
                formData.currentStatusId,
                formData.nextStatusId
              );

              if (exists) {
                stepErrors.push("A step with this status transition already exists");
                allValid = false;
              }
            } catch (error) {
              console.error("Error checking step existence:", error);
              // Don't fail validation if the check fails
            }
          }
          break;

        case 3: // Options
          if (formData.requiresApproval) {
            if (!formData.approvalType) {
              stepErrors.push("Please select an approval type");
              allValid = false;
            }
            if (formData.approvalType === "user" && !formData.approvalUserId) {
              stepErrors.push("Please select an approver");
              allValid = false;
            }
            if (formData.approvalType === "group" && !formData.approvalGroupId) {
              stepErrors.push("Please select an approval group");
              allValid = false;
            }
          }
          break;

        case 4: // Review
          // No validation needed for review step
          break;
      }

      if (stepErrors.length > 0) {
        newErrors[step] = stepErrors;
      }
    }

    // Set all errors at once
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
    }
    
    return allValid;
  };

  return (
    <StepFormContext.Provider
      value={{
        currentStep,
        formData,
        setFormData,
        nextStep,
        prevStep,
        setCurrentStep,
        resetForm,
        submitForm,
        isSubmitting,
        isEditMode,
        stepId: editStep?.id,
        totalSteps,
        validateCurrentStep,
        registerStepForm,
        formErrors,
      }}
    >
      {children}
    </StepFormContext.Provider>
  );
};
