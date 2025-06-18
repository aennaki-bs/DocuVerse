import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MultiStepFormContext from "./MultiStepFormContext";
import { FormData, StepValidation, initialFormData } from "./types";
import {
  validateUsername as validateUsernameUtil,
  validateEmail as validateEmailUtil,
  debounceUsernameValidation,
  debounceEmailValidation,
} from "./utils/validationUtils";
import {
  registerUser as registerUserUtil,
  verifyEmail as verifyEmailUtil,
} from "./utils/registerUtils";

export const MultiStepFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormDataState] = useState<FormData>(initialFormData);
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    isLoading: false,
    errors: {},
  });
  const navigate = useNavigate();

  // Use debounced validation for username and email as they change
  useEffect(() => {
    if (formData.username && formData.username.length >= 4) {
      debounceUsernameValidation(formData.username, setStepValidation);
    }
  }, [formData.username]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && emailRegex.test(formData.email)) {
      debounceEmailValidation(formData.email, setStepValidation);
    }
  }, [formData.email]);

  const setFormData = (data: Partial<FormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));

    // Clear registration error when user updates any field
    // This allows resubmission after fixing the error
    if (stepValidation.errors.registration) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, registration: undefined },
      }));
    }

    // Clear validation error when user updates any field
    if (data.validationError === undefined && formData.validationError) {
      setFormDataState((prev) => ({ ...prev, validationError: undefined }));
    }

    // If admin secret key is changed, clear any related errors
    if ("adminSecretKey" in data) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, registration: undefined },
      }));
    }

    // Clear specific field validation errors when the field changes
    const fieldKeys = Object.keys(data);
    if (fieldKeys.includes("username") && stepValidation.errors.username) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, username: undefined },
      }));
    }

    if (fieldKeys.includes("email") && stepValidation.errors.email) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, email: undefined },
      }));
    }
  };

  // Next step logic, handle extra steps.
  const nextStep = () => {
    // Clear all validation errors when moving to next step
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));
    setFormData({ validationError: undefined });

    // Both flows now have 7 steps (including type selection)
    // Personal flow: 0. Type Selection, 1. Info, 2. Address, 3. Username/Email, 4. Password, 5. Admin Key, 6. Summary
    // Company flow: 0. Type Selection, 1. Info, 2. Address, 3. Username/Email, 4. Password, 5. Admin Key, 6. Summary
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  // Previous step logic
  const prevStep = () => {
    // Clear all validation errors when moving back
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));
    setFormData({ validationError: undefined });

    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Go to a specific step
  const goToStep = (step: number) => {
    if (step >= 0 && step <= 6) {
      setCurrentStep(step);

      // Clear any validation errors when jumping to a step
      setStepValidation((prev) => ({
        ...prev,
        errors: {},
      }));
      setFormData({ validationError: undefined });
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormDataState(initialFormData);
    setStepValidation({ isLoading: false, errors: {} });
  };

  const validateUsername = async (): Promise<boolean> => {
    return validateUsernameUtil(formData.username, setStepValidation);
  };

  const validateEmail = async (): Promise<boolean> => {
    return validateEmailUtil(formData.email, setStepValidation);
  };

  // Validate the current step
  const validateCurrentStep = async (): Promise<boolean> => {
    // Clear previous errors
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));

    try {
      // Step-specific validation
      switch (currentStep) {
        case 0: // Account type selection - always valid
          return true;

        case 1: // Personal/Company Info
          if (formData.userType === "personal") {
            if (!formData.firstName || !formData.lastName) {
              setFormData({
                validationError: "Please fill out all required fields",
              });
              return false;
            }
          } else {
            if (!formData.companyName || !formData.companyRC) {
              setFormData({
                validationError: "Please fill out all required fields",
              });
              return false;
            }
          }
          return true;

        case 2: // Address
          // Basic validation for address fields
          const requiredAddressFields = ["city", "country"];
          const missingAddressField = requiredAddressFields.some(
            (field) => !formData[field as keyof FormData]
          );

          if (missingAddressField) {
            setFormData({
              validationError: "Please fill out all required address fields",
            });
            return false;
          }
          return true;

        case 3: // Username/Email
          // Username validation
          const isUserValid = await validateUsername();
          // Email validation
          const isEmailValid = await validateEmail();

          return isUserValid && isEmailValid;

        case 4: // Password
          if (!formData.password) {
            setFormData({ validationError: "Password is required" });
            return false;
          }

          if (formData.password !== formData.confirmPassword) {
            setFormData({ validationError: "Passwords do not match" });
            return false;
          }

          if (formData.password.length < 8) {
            setFormData({
              validationError: "Password must be at least 8 characters",
            });
            return false;
          }

          return true;

        case 5: // Admin access - Validate admin key if admin access is requested
          if (formData.requestAdminAccess && !formData.adminSecretKey) {
            setFormData({ validationError: "Admin key is required when requesting admin access" });
            return false;
          }
          return true;

        case 6: // Review - No validation needed
          return true;

        default:
          return true;
      }
    } catch (error) {
      console.error("Validation error:", error);
      setFormData({ validationError: "An error occurred during validation" });
      return false;
    }
  };

  const registerUser = async (): Promise<boolean> => {
    // Clear any previous validation errors before attempting registration
    setStepValidation((prev) => ({
      ...prev,
      errors: {},
    }));

    return registerUserUtil(formData, setStepValidation, navigate);
  };

  // Submit form - called from the review step
  const submitForm = async (): Promise<boolean> => {
    // Final validation of all steps
    try {
      // Set loading state
      setStepValidation((prev) => ({
        ...prev,
        isLoading: true,
      }));

      // Validate username and email again as final check
      const isUsernameValid = await validateUsername();
      const isEmailValid = await validateEmail();

      if (!isUsernameValid || !isEmailValid) {
        setStepValidation((prev) => ({
          ...prev,
          isLoading: false,
        }));
        return false;
      }

      // Attempt to register the user
      const success = await registerUser();

      setStepValidation((prev) => ({
        ...prev,
        isLoading: false,
      }));

      return success;
    } catch (error) {
      console.error("Form submission error:", error);
      setStepValidation((prev) => ({
        ...prev,
        isLoading: false,
        errors: {
          ...prev.errors,
          registration: "An unexpected error occurred during submission",
        },
      }));
      return false;
    }
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    // Clear verification errors before attempting verification
    setStepValidation((prev) => ({
      ...prev,
      errors: { ...prev.errors, verification: undefined },
    }));

    return verifyEmailUtil(formData.email, code, setStepValidation, navigate);
  };

  return (
    <MultiStepFormContext.Provider
      value={{
        currentStep,
        formData,
        stepValidation,
        nextStep,
        prevStep,
        setCurrentStep,
        setFormData,
        validateUsername,
        validateEmail,
        registerUser,
        verifyEmail,
        resetForm,
        validateCurrentStep,
        submitForm,
        goToStep,
      }}
    >
      {children}
    </MultiStepFormContext.Provider>
  );
};
