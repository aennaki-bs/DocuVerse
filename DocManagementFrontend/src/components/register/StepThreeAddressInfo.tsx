import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Globe, AlertCircle } from "lucide-react";

// Extended FormData interface with address-related properties
interface ExtendedFormData {
  userType?: string;
  address?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  website?: string;
  [key: string]: any;
}

const AddressStep: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();
  // Cast formData to ExtendedFormData to solve TypeScript errors
  const typedFormData = formData as ExtendedFormData;

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isPersonal = typedFormData.userType === "personal";

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

    // Only city and country are required fields
    if (["city", "country"].includes(name) && !value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Phone number validation
    if (name === "phoneNumber" && value.trim()) {
      const phonePattern =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phonePattern.test(value)) {
        error = "Please enter a valid phone number";
      }
    }

    // Website validation (optional field)
    if (name === "website" && value.trim()) {
      try {
        new URL(value.startsWith("http") ? value : `https://${value}`);
      } catch {
        error = "Please enter a valid website URL";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Only city and country are required fields
    const requiredFields = ["city", "country"];

    requiredFields.forEach((field) => {
      const value = typedFormData[field] || "";
      if (!value.toString().trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        isValid = false;
      }
    });

    // Validate phone number format if provided
    if (typedFormData.phoneNumber) {
      const phonePattern =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phonePattern.test(typedFormData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
        isValid = false;
      }
    }

    // Validate website if provided
    if (typedFormData.website) {
      try {
        new URL(
          typedFormData.website.startsWith("http")
            ? typedFormData.website
            : `https://${typedFormData.website}`
        );
      } catch {
        newErrors.website = "Please enter a valid website URL";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark required fields as touched
    const touchedFields = {
      city: true,
      country: true,
    };

    setTouched((prev) => ({ ...prev, ...touchedFields }));

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        {/* Address Information */}
        <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-full bg-blue-800/20 text-blue-400">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-medium text-blue-200">
              Contact Information
            </h3>
          </div>

          <div className="space-y-3">
            {/* City - Required */}
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-blue-200 text-xs">
                City
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <Input
                  id="city"
                  name="city"
                  value={typedFormData.city || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your city"
                  className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                    "city"
                  )} text-white placeholder:text-blue-300/50`}
                />
                {touched.city && errors.city && (
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
              {touched.city && errors.city && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {errors.city}
                </motion.p>
              )}
            </div>

            {/* Country - Required - Changed to textbox input */}
            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-blue-200 text-xs">
                Country
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <Input
                  id="country"
                  name="country"
                  value={typedFormData.country || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your country"
                  className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                    "country"
                  )} text-white placeholder:text-blue-300/50`}
                />
                {touched.country && errors.country && (
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
              {touched.country && errors.country && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {errors.country}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Address - Optional */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="address"
                  className="text-blue-200 text-xs flex items-center gap-1"
                >
                  Address{" "}
                  <span className="text-blue-400 text-[10px]">(optional)</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <Input
                    id="address"
                    name="address"
                    value={typedFormData.address || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your address"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "address"
                    )} text-white placeholder:text-blue-300/50`}
                  />
                </div>
              </div>

              {/* Phone Number - Optional */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="phoneNumber"
                  className="text-blue-200 text-xs flex items-center gap-1"
                >
                  Phone Number{" "}
                  <span className="text-blue-400 text-[10px]">(optional)</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={typedFormData.phoneNumber || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter phone number"
                    className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                      "phoneNumber"
                    )} text-white placeholder:text-blue-300/50`}
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
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
                {touched.phoneNumber && errors.phoneNumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                    {errors.phoneNumber}
                  </motion.p>
                )}
              </div>

              {/* Website - Only shown for company accounts */}
              {!isPersonal && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label
                    htmlFor="website"
                    className="text-blue-200 text-xs flex items-center gap-1"
                  >
                    Company Website{" "}
                    <span className="text-blue-400 text-[10px]">
                      (optional)
                    </span>
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <Input
                      id="website"
                      name="website"
                      value={typedFormData.website || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter company website URL"
                      className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                        "website"
                      )} text-white placeholder:text-blue-300/50`}
                    />
                    {touched.website && errors.website && (
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
                  {touched.website && errors.website && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                      {errors.website}
                    </motion.p>
                  )}
                </div>
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
            Only city and country are required. Other contact information is
            optional.
          </p>
        </div>
      </div>
    </form>
  );
};

export default AddressStep;
