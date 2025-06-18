import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import { validateUsernameEmailStep } from "./utils/validation";
import StepContainer from "./utils/StepContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, Mail, CheckCircle2, AlertCircle } from "lucide-react";

const StepThreeCompanyUsernameEmail = () => {
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
  });

  useEffect(() => {
    const errors = validateUsernameEmailStep(formData);
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
    const errors = validateUsernameEmailStep(formData);

    // Set all fields as touched
    setTouchedFields({
      username: true,
      email: true,
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

  // Helper function to determine if a field is valid
  const isFieldValid = (fieldName: string, value?: string) => {
    return (
      value &&
      value.trim().length > 0 &&
      !visibleErrors[fieldName] &&
      !stepValidation.errors[fieldName]
    );
  };

  return (
    <StepContainer
      onNext={handleNext}
      onBack={prevStep}
      isNextLoading={stepValidation.isLoading}
      isNextDisabled={stepValidation.isLoading}
      nextLabel={stepValidation.isLoading ? "Validating..." : "Next"}
    >
      {/* Company Email */}
      <div className="space-y-1">
        <Label
          htmlFor="email"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-amber-400" />
            <span>Company Email</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="yourcompany@example.com"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={!!visibleErrors.email || !!stepValidation.errors.email}
            value={formData.email || ""}
            onChange={handleChange}
          />
          {visibleErrors.email || stepValidation.errors.email ? (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
          ) : (
            isFieldValid("email", formData.email) && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )
          )}
        </div>
        {(visibleErrors.email || stepValidation.errors.email) && (
          <p className="text-xs text-red-500">
            {visibleErrors.email || stepValidation.errors.email}
          </p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-1">
        <Label
          htmlFor="username"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4 text-amber-400" />
            <span>Company Username</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <AtSign className="h-4 w-4" />
          </div>
          <Input
            id="username"
            name="username"
            placeholder="company_username"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={!!visibleErrors.username || !!stepValidation.errors.username}
            value={formData.username || ""}
            onChange={handleChange}
          />
          {visibleErrors.username || stepValidation.errors.username ? (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
          ) : (
            isFieldValid("username", formData.username) && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )
          )}
        </div>
        {(visibleErrors.username || stepValidation.errors.username) && (
          <p className="text-xs text-red-500">
            {visibleErrors.username || stepValidation.errors.username}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Username must be at least 4 characters
        </p>
      </div>
    </StepContainer>
  );
};

export default StepThreeCompanyUsernameEmail;
