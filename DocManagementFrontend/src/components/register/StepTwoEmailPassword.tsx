import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import { validateEmailPasswordStep } from "./utils/validation";
import { usePasswordStrength } from "./hooks/usePasswordStrength";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import StepTwoFormFields from "./step-two/StepTwoFormFields";

const StepTwoEmailPassword = () => {
  const {
    formData,
    setFormData,
    prevStep,
    nextStep,
    validateEmail,
    validateUsername,
    stepValidation,
  } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const { calculatePasswordStrength } = usePasswordStrength();
  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Mark field as touched when the user interacts with it
    if (!touchedFields[name as keyof typeof touchedFields]) {
      setTouchedFields((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  // Validate on data change
  useEffect(() => {
    const errors = validateEmailPasswordStep(formData);
    setLocalErrors(errors);
  }, [formData]);

  const validateStep = (showToast = true) => {
    const errors = validateEmailPasswordStep(formData);

    // Set all fields as touched when user tries to proceed
    setTouchedFields({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    setLocalErrors(errors);

    if (showToast && Object.keys(errors).length > 0) {
      toast.error("Please correct all errors before proceeding");
    }

    return Object.keys(errors).length === 0;
  };

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach((key) => {
    if (touchedFields[key as keyof typeof touchedFields]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  const handleNext = async () => {
    // Mark all fields as touched when user tries to proceed
    setTouchedFields({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateStep()) {
      return;
    }

    try {
      const isUsernameValid = await validateUsername();
      if (!isUsernameValid) {
        return;
      }

      const isEmailValid = await validateEmail();
      if (!isEmailValid) {
        return;
      }

      nextStep();
    } catch (error) {
      toast.error("An error occurred during validation.");
      console.error("Validation error:", error);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-gradient-to-br from-[#101b30]/80 to-[#0d1528]/80 backdrop-blur-sm rounded-xl border border-blue-900/30 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 space-y-5">
          <StepTwoFormFields
            formData={formData}
            onChange={handleChange}
            localErrors={visibleErrors}
            validationErrors={stepValidation.errors}
            passwordStrength={passwordStrength}
          />
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 pt-2 w-full">
        <button
          onClick={prevStep}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-blue-300 bg-[#0f1729]/80 backdrop-blur-sm border border-blue-900/30 hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          disabled={stepValidation.isLoading}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm disabled:opacity-70 shadow-lg shadow-blue-500/20"
        >
          {stepValidation.isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Validating...</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepTwoEmailPassword;
