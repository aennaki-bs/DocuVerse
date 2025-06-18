import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Building2,
  PenLine,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const PersonalInfoForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();
  const { userType } = formData;

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle field blur
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, e.target.value);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = "";

    // Required fields
    if (
      (userType === "personal" &&
        ["firstName", "lastName"].includes(name) &&
        !value.trim()) ||
      (userType === "company" &&
        ["companyName", "companyRC"].includes(name) &&
        !value.trim())
    ) {
      error = `${name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} is required`;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (userType === "personal") {
      // Personal account validation
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First Name is required";
        isValid = false;
      }

      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last Name is required";
        isValid = false;
      }

      // ID is optional
    } else {
      // Company account validation
      if (!formData.companyName?.trim()) {
        newErrors.companyName = "Company Name is required";
        isValid = false;
      }

      if (!formData.companyRC?.trim()) {
        newErrors.companyRC = "Registration Number is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const requiredFields =
      userType === "personal"
        ? { firstName: true, lastName: true, cin: true }
        : { companyName: true, companyRC: true };

    setTouched((prev) => ({ ...prev, ...requiredFields }));

    // Validate all fields
    if (validateForm()) {
      nextStep();
    }
  };

  // Helper function to determine input border color based on error state
  const getInputBorderClass = (field: string) => {
    if (touched[field] && errors[field]) {
      return "border-red-500/70 focus:border-red-500/70 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_0_15px_rgba(239,68,68,0.2)]";
    }
    return "border-blue-900/50 focus:border-blue-500/50 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]";
  };

  const renderFormContent = () => {
    if (userType === "personal") {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-blue-800/20 text-blue-400">
                <User className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-blue-200">
                Personal Information
              </h3>
            </div>

            <div className="space-y-3">
              {/* First name */}
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-blue-200 text-xs">
                  First Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "firstName"
                    )} text-white placeholder:text-blue-300/50`}
                    autoComplete="given-name"
                  />
                  {touched.firstName && errors.firstName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {touched.firstName && errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              {/* Last name */}
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-blue-200 text-xs">
                  Last Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "lastName"
                    )} text-white placeholder:text-blue-300/50`}
                    autoComplete="family-name"
                  />
                  {touched.lastName && errors.lastName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {touched.lastName && errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.lastName}
                  </motion.p>
                )}
              </div>

              {/* ID Number (optional) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="cin"
                  className="text-blue-200 text-xs flex items-center gap-1"
                >
                  ID Number{" "}
                  <span className="text-blue-400 text-[10px]">(optional)</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <Input
                    id="cin"
                    name="cin"
                    value={formData.cin || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Government-issued ID number"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "cin"
                    )} text-white placeholder:text-blue-300/50`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Smaller info alert */}
          <div className="bg-blue-900/30 rounded-lg p-2.5 text-xs text-blue-300 border border-blue-800/30">
            <p className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-blue-400 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Please provide your legal name as it will be used for account
              verification.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-blue-800/20 text-blue-400">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-blue-200">
                Company Information
              </h3>
            </div>

            <div className="space-y-3">
              {/* Company name */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-blue-200 text-xs">
                  Company Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter company name"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "companyName"
                    )} text-white placeholder:text-blue-300/50`}
                    autoComplete="organization"
                  />
                  {touched.companyName && errors.companyName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {touched.companyName && errors.companyName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.companyName}
                  </motion.p>
                )}
              </div>

              {/* Registration number */}
              <div className="space-y-1.5">
                <Label htmlFor="companyRC" className="text-blue-200 text-xs">
                  Registration Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <Input
                    id="companyRC"
                    name="companyRC"
                    value={formData.companyRC || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Company registration ID"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "companyRC"
                    )} text-white placeholder:text-blue-300/50`}
                  />
                  {touched.companyRC && errors.companyRC && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {touched.companyRC && errors.companyRC && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.companyRC}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          {/* Smaller info alert */}
          <div className="bg-blue-900/30 rounded-lg p-2.5 text-xs text-blue-300 border border-blue-800/30">
            <p className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-blue-400 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Please provide your legal company name and registration number as
              it appears on official documents.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {renderFormContent()}
    </form>
  );
};

export default PersonalInfoForm;
