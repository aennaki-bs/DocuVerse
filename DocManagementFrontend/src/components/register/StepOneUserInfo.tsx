import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const AccountDetails: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isPersonal = formData.userType === "personal";

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

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
      error = `${
        name.charAt(0).toUpperCase() +
        name
          .slice(1)
          .replace(/([A-Z])/g, " $1")
          .trim()
      } is required`;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Define required fields based on account type
    const requiredFields = isPersonal
      ? ["firstName", "lastName"]
      : ["companyName", "companyRC"];

    requiredFields.forEach((field) => {
      const value = formData[field as keyof typeof formData] || "";
      if (!value.toString().trim()) {
        const fieldName = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .replace(/Company/g, "");

        newErrors[field] = `${fieldName} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark required fields as touched
    const touchedFields = isPersonal
      ? { firstName: true, lastName: true }
      : { companyName: true, companyRC: true };

    setTouched((prev) => ({ ...prev, ...touchedFields }));

    // Validate all fields
    if (validateForm()) {
      nextStep();
    }
  };

  // Check if field has error
  const hasError = (name: string) => {
    return touched[name] && errors[name];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {isPersonal ? (
          // Personal Account Fields
          <>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="flex items-center gap-1 mb-1.5"
                >
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your first name"
                  className={hasError("firstName") ? "border-red-300" : ""}
                />
                {hasError("firstName") && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="flex items-center gap-1 mb-1.5"
                >
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your last name"
                  className={hasError("lastName") ? "border-red-300" : ""}
                />
                {hasError("lastName") && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>

              <div>
                <Label htmlFor="cin" className="flex items-center gap-1 mb-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                  ID Number (optional)
                </Label>
                <Input
                  id="cin"
                  name="cin"
                  value={formData.cin || ""}
                  onChange={handleChange}
                  placeholder="Enter your ID/passport number"
                  className={hasError("cin") ? "border-red-300" : ""}
                />
                {hasError("cin") && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.cin}
                  </motion.p>
                )}
              </div>
            </div>
          </>
        ) : (
          // Company Account Fields
          <>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="companyName"
                  className="flex items-center gap-1 mb-1.5"
                >
                  <Building className="h-3.5 w-3.5 text-blue-500" />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your company name"
                  className={hasError("companyName") ? "border-red-300" : ""}
                />
                {hasError("companyName") && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.companyName}
                  </motion.p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="companyRC"
                  className="flex items-center gap-1 mb-1.5"
                >
                  <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                  Registration Number
                </Label>
                <Input
                  id="companyRC"
                  name="companyRC"
                  value={formData.companyRC || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter company registration number"
                  className={hasError("companyRC") ? "border-red-300" : ""}
                />
                {hasError("companyRC") && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.companyRC}
                  </motion.p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="companyWebsite"
                  className="flex items-center gap-1 mb-1.5"
                >
                  Website (optional)
                </Label>
                <Input
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite || ""}
                  onChange={handleChange}
                  placeholder="Enter company website URL"
                  className={hasError("companyWebsite") ? "border-red-300" : ""}
                />
                {hasError("companyWebsite") && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.companyWebsite}
                  </motion.p>
                )}
              </div>
            </div>
          </>
        )}
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

export default AccountDetails;
