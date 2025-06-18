import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Building, Home } from "lucide-react";
import { motion } from "framer-motion";

const AddressForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();
  const userType = formData.userType || "personal";

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isPersonal = userType === "personal";

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form data in context
    if (isPersonal) {
      setFormData({ [name]: value });
    } else {
      setFormData({
        [`company${name.charAt(0).toUpperCase() + name.slice(1)}`]: value,
      });
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, e.target.value);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Fields to validate based on user type
    const fields = isPersonal
      ? ["address", "city", "country", "phoneNumber"]
      : ["address", "city", "country", "phoneNumber"];

    fields.forEach((field) => {
      let value = "";

      if (isPersonal) {
        value = formData[field] || "";
      } else {
        const companyField = `company${
          field.charAt(0).toUpperCase() + field.slice(1)
        }`;
        value = formData[companyField] || "";
      }

      if (!value.trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() +
          field
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        } is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = ["address", "city", "country", "phoneNumber"];
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setTouched(touchedFields);

    // Validate all fields
    if (validateForm()) {
      nextStep();
    }
  };

  // Get value and error for a field
  const getFieldProps = (name: string) => {
    const value = isPersonal
      ? formData[name] || ""
      : formData[`company${name.charAt(0).toUpperCase() + name.slice(1)}`] ||
        "";

    return {
      name,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
    };
  };

  // Check if field has error
  const hasError = (name: string) => {
    return touched[name] && errors[name];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="flex items-center gap-1 mb-1.5">
            <Home className="h-3.5 w-3.5 text-blue-500" />
            {isPersonal ? "Home Address" : "Company Address"}
          </Label>
          <Input
            id="address"
            placeholder={
              isPersonal ? "Enter your home address" : "Enter company address"
            }
            {...getFieldProps("address")}
            className={hasError("address") ? "border-red-300" : ""}
          />
          {hasError("address") && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1"
            >
              {errors.address}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="flex items-center gap-1 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              City
            </Label>
            <Input
              id="city"
              placeholder="Enter city"
              {...getFieldProps("city")}
              className={hasError("city") ? "border-red-300" : ""}
            />
            {hasError("city") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {errors.city}
              </motion.p>
            )}
          </div>

          <div>
            <Label htmlFor="country" className="flex items-center gap-1 mb-1.5">
              <Building className="h-3.5 w-3.5 text-blue-500" />
              Country
            </Label>
            <Input
              id="country"
              placeholder="Enter country"
              {...getFieldProps("country")}
              className={hasError("country") ? "border-red-300" : ""}
            />
            {hasError("country") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {errors.country}
              </motion.p>
            )}
          </div>
        </div>

        <div>
          <Label
            htmlFor="phoneNumber"
            className="flex items-center gap-1 mb-1.5"
          >
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            {...getFieldProps("phoneNumber")}
            className={hasError("phoneNumber") ? "border-red-300" : ""}
          />
          {hasError("phoneNumber") && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1"
            >
              {errors.phoneNumber}
            </motion.p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
