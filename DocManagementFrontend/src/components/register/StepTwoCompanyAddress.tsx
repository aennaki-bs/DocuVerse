import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import CompanyAddressFields from "./company/CompanyAddressFields";
import StepContainer from "./utils/StepContainer";

// Optional validation for company address
const validateCompanyAddress = (formData: {
  companyAddress?: string;
  companyCity?: string;
  companyCountry?: string;
}) => {
  const errors: Record<string, string> = {};

  // These fields are optional, only validate if provided
  if (formData.companyAddress && formData.companyAddress.trim().length === 0) {
    errors.companyAddress = "Company address cannot be empty if provided";
  }

  if (formData.companyCity && formData.companyCity.trim().length === 0) {
    errors.companyCity = "City cannot be empty if provided";
  }

  if (formData.companyCountry && formData.companyCountry.trim().length === 0) {
    errors.companyCountry = "Country cannot be empty if provided";
  }

  return errors;
};

const StepTwoCompanyAddress = () => {
  const { formData, setFormData, prevStep, nextStep } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState({
    companyAddress: false,
    companyCity: false,
    companyCountry: false,
  });

  useEffect(() => {
    const errors = validateCompanyAddress(formData);
    setLocalErrors(errors);
  }, [formData]);

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

  const validateStep = () => {
    const errors = validateCompanyAddress(formData);

    // Set all fields as touched
    setTouchedFields({
      companyAddress: true,
      companyCity: true,
      companyCountry: true,
    });

    setLocalErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error("Please correct the errors before proceeding");
      return;
    }

    nextStep();
  };

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach((key) => {
    if (touchedFields[key as keyof typeof touchedFields]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  return (
    <StepContainer onNext={handleNext} onBack={prevStep}>
      <CompanyAddressFields
        formData={formData}
        localErrors={visibleErrors}
        handleChange={handleChange}
      />
    </StepContainer>
  );
};

export default StepTwoCompanyAddress;
