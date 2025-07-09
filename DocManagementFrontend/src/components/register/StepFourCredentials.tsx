import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, User, Check, X, Loader2, AlertCircle } from "lucide-react";
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

  // Helper function to check if a field is valid
  const isFieldValid = (name: string, value: string) => {
    if (!value?.trim()) return false;
    
    // Check for validation errors from the API
    if (stepValidation.errors[name]) return false;
    
    if (name === "username") {
      return value.length >= 4;
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
    return false;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validate field in real-time
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Handle field blur
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const isValid = validateField(name, value);

    // If the field is valid, check with the API (only if not already checking)
    if (isValid && value) {
      if (name === "username" && value.length >= 4 && !isChecking.username) {
        setIsChecking((prev) => ({ ...prev, username: true }));
        try {
          // API call to validate username
          await validateUsername();
        } finally {
          setIsChecking((prev) => ({ ...prev, username: false }));
        }
      } else if (name === "email" && value.includes("@") && !isChecking.email) {
        setIsChecking((prev) => ({ ...prev, email: true }));
        try {
          // API call to validate email
          await validateEmail();
        } finally {
          setIsChecking((prev) => ({ ...prev, email: false }));
        }
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

  // Validate all fields
  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate username
    if (!formData.username?.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
      isValid = false;
    }

    // Validate email
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    setErrors(newErrors);

    // If client validation passes, perform API validation
    if (isValid) {
      // Don't start new validation if already in progress
      if (isChecking.username || isChecking.email) {
        return false;
      }

      setIsChecking({ username: true, email: true });

      try {
        // Check both username and email availability
        const [usernameValid, emailValid] = await Promise.all([
          validateUsername(),
          validateEmail(),
        ]);

        // If either validation fails, update errors from the context
        if (!usernameValid || !emailValid) {
          if (stepValidation.errors.username) {
            newErrors.username = stepValidation.errors.username;
          }
          if (stepValidation.errors.email) {
            newErrors.email = stepValidation.errors.email;
          }
          setErrors(newErrors);
          return false;
        }

        return usernameValid && emailValid;
      } finally {
        setIsChecking({ username: false, email: false });
      }
    }

    return isValid;
  };

  // Helper function to check if form can be submitted
  const canSubmit = () => {
    // Check if validation is in progress
    if (isChecking.username || isChecking.email) {
      return false;
    }
    
    // Check if there are any validation errors
    if (errors.username || errors.email || stepValidation.errors.username || stepValidation.errors.email) {
      return false;
    }
    
    // Check if fields are properly filled and valid
    const usernameValid = isFieldValid("username", formData.username || "");
    const emailValid = isFieldValid("email", formData.email || "");
    
    return usernameValid && emailValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if form is not ready
    if (!canSubmit()) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
    });

    // Validate all fields
    const isValid = await validateForm();
    if (isValid) {
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-full bg-blue-800/20 text-blue-400">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-medium text-blue-200">
            Account Information
          </h3>
        </div>

        <div className="space-y-3">
          {/* Username field */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-blue-200 text-xs">
              Username
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Choose a username"
                className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                  "username"
                )} text-white placeholder:text-blue-300/50`}
                autoComplete="username"
              />
              {isChecking.username ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                </div>
              ) : errors.username ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              ) : touched.username && !errors.username && isFieldValid("username", formData.username || "") ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : null}
            </div>
            {touched.username && errors.username && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
              >
                <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                {errors.username}
              </motion.p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-blue-200 text-xs">
              Email Address
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                <AtSign className="h-4 w-4" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email address"
                className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                  "email"
                )} text-white placeholder:text-blue-300/50`}
                autoComplete="email"
              />
              {isChecking.email ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                </div>
              ) : errors.email ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              ) : touched.email && !errors.email && isFieldValid("email", formData.email || "") ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : null}
            </div>
            {touched.email && errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
              >
                <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                {errors.email}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Info message */}
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
          You will use these credentials to log in to your account. We'll send a
          verification email after registration.
        </p>
      </div>
    </form>
  );
};

export default UsernameEmailForm;
