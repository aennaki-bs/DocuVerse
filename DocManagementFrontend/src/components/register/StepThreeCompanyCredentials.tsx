import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import RegisterButton from "./utils/RegisterButton";
import CompanyCredentialsFields from "./company/CompanyCredentialsFields";
import { usePasswordStrength } from "./hooks/usePasswordStrength";
import { validateEmailPasswordStep } from "./utils/validation";
import { ScrollArea } from "@/components/ui/scroll-area";

const StepThreeCompanyCredentials = () => {
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

  useEffect(() => {
    const errors = validateEmailPasswordStep(formData);
    setLocalErrors(errors);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If updating email field, also update companyEmail
    if (name === "email") {
      setFormData({
        email: value,
        companyEmail: value,
      });
    }
    // If updating username field, update both username and companyAlias
    else if (name === "username") {
      setFormData({
        username: value,
      });
    } else {
      setFormData({ [name]: value });
    }

    // Mark field as touched when the user interacts with it
    if (!touchedFields[name as keyof typeof touchedFields]) {
      setTouchedFields((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  const validateStep = () => {
    const errors = validateEmailPasswordStep(formData);

    // Set all fields as touched
    setTouchedFields({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    setLocalErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please correct the errors before proceeding");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
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

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach((key) => {
    if (touchedFields[key as keyof typeof touchedFields]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  return (
    <div className="space-y-5">
      <ScrollArea className="h-[340px] pr-4">
        <CompanyCredentialsFields
          formData={{
            companyEmail: formData.email,
            username: formData.username,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }}
          localErrors={visibleErrors}
          validationErrors={stepValidation.errors}
          handleChange={handleChange}
          passwordStrength={passwordStrength}
        />
      </ScrollArea>

      <div className="pt-4 flex items-center justify-between gap-3">
        <RegisterButton buttonType="back" onClick={prevStep} className="w-1/3">
          Back
        </RegisterButton>
        <RegisterButton
          buttonType="next"
          onClick={handleNext}
          loading={stepValidation.isLoading}
          disabled={stepValidation.isLoading}
          className="w-2/3"
        >
          Next
        </RegisterButton>
      </div>
    </div>
  );
};

export default StepThreeCompanyCredentials;
