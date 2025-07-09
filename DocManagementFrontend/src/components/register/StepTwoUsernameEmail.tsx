import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, User, Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const UsernameEmailForm: React.FC = () => {
  const { formData, setFormData, nextStep, validateUsername, validateEmail } =
    useMultiStepForm();
  const { stepValidation } = useMultiStepForm();

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState({
    username: false,
    email: false,
  });

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
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const isValid = validateField(name, value);

    // If the field is valid, check with the API
    if (isValid && value) {
      if (name === "username" && value.length >= 4) {
        setIsChecking((prev) => ({ ...prev, username: true }));
        // API call to validate username
        await validateUsername();
        setIsChecking((prev) => ({ ...prev, username: false }));
      } else if (name === "email" && value.includes("@")) {
        setIsChecking((prev) => ({ ...prev, email: true }));
        // API call to validate email (database check only)
        await validateEmail();
        setIsChecking((prev) => ({ ...prev, email: false }));
      }
    }
  };

  // Update local errors from context when API validation completes
  useEffect(() => {
    if (stepValidation.errors.username) {
      setErrors((prev) => ({
        ...prev,
        username: stepValidation.errors.username,
      }));
    }
    if (stepValidation.errors.email) {
      setErrors((prev) => ({ ...prev, email: stepValidation.errors.email }));
    }
  }, [stepValidation.errors.username, stepValidation.errors.email]);

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === "username" && value.length < 4) {
      error = "Username must be at least 4 characters";
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Please enter a valid email address";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Component form submission started');

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
    });

    // Basic client-side validation
    const clientValid = validateField('username', formData.username || '') && 
                       validateField('email', formData.email || '');

    if (clientValid) {
      console.log('Client validation passed, calling nextStep');
      await nextStep(); // nextStep now handles the API validation
    } else {
      console.log('Client validation failed');
    }
  };

  // Get field status icon
  const getStatusIcon = (name: string) => {
    if (isChecking[name as keyof typeof isChecking]) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }

    if (touched[name] && !errors[name]) {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (touched[name] && errors[name]) {
      return <X className="h-4 w-4 text-red-500" />;
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="username" className="flex items-center gap-1 mb-1.5">
            <User className="h-3.5 w-3.5 text-blue-500" />
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Choose a unique username"
              className={
                errors.username && touched.username
                  ? "border-red-300 pr-8"
                  : "pr-8"
              }
              autoComplete="username"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {getStatusIcon("username")}
            </div>
          </div>
          {errors.username && touched.username && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1"
            >
              {errors.username}
            </motion.p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-1 mb-1.5">
            <AtSign className="h-3.5 w-3.5 text-blue-500" />
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email address"
              className={
                errors.email && touched.email ? "border-red-300 pr-8" : "pr-8"
              }
              autoComplete="email"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {getStatusIcon("email")}
            </div>
          </div>
          {errors.email && touched.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1"
            >
              {errors.email}
            </motion.p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mt-2">
          Your username will be your unique identifier in the system. We'll use
          your email for account verification and important notifications.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
          disabled={isChecking.username || isChecking.email || stepValidation.isLoading}
        >
          {isChecking.username || isChecking.email || stepValidation.isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {stepValidation.isLoading ? "Verifying email existence..." : "Checking availability..."}
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </form>
  );
};

export default UsernameEmailForm;
