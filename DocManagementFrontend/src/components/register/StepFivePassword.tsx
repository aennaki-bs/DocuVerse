import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Check, X, Shield, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Password component with strength meter
const PasswordForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize password strength when component mounts or password exists
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);

  // Password requirements
  const passwordRequirements = [
    {
      id: "length",
      label: "At least 8 characters long",
      test: (pass: string) => pass.length >= 8,
    },
    {
      id: "lowercase",
      label: "Contains lowercase letter",
      test: (pass: string) => /[a-z]/.test(pass),
    },
    {
      id: "uppercase",
      label: "Contains uppercase letter",
      test: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      id: "number",
      label: "Contains a number",
      test: (pass: string) => /\d/.test(pass),
    },
    {
      id: "special",
      label: "Contains a special character",
      test: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let score = 0;
    passwordRequirements.forEach((req) => {
      if (req.test(password)) {
        score += 20; // 5 requirements, each worth 20%
      }
    });

    return score;
  };

  // Get strength color
  const getStrengthColor = (strength: number): string => {
    if (strength < 60) return "bg-red-500";
    if (strength < 100) return "bg-amber-500";
    return "bg-green-500";
  };

  // Get strength text
  const getStrengthText = (
    strength: number
  ): { text: string; color: string } => {
    if (strength < 60) return { text: "Weak", color: "text-red-400" };
    if (strength < 100) return { text: "Good", color: "text-amber-400" };
    return { text: "Strong", color: "text-green-400" };
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Update password strength when password changes
    if (name === "password") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Check passwords match when confirm password changes
    if (name === "confirmPassword" && value && formData.password) {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    // Check passwords match when password changes if confirm password is not empty
    if (name === "password" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
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

    if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters";
      } else if (calculatePasswordStrength(value) < 100) {
        error = "Password must meet all 5 requirements to be strong";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        error = "Please confirm your password";
      } else if (value !== formData.password) {
        error = "Passwords don't match";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (calculatePasswordStrength(formData.password) < 100) {
      newErrors.password = "Password must meet all 5 requirements to be strong";
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    if (validateForm()) {
      nextStep();
    }
  };

  // Check if requirement passes
  const requirementPasses = (requirement: {
    id: string;
    test: (pass: string) => boolean;
  }) => {
    return formData.password && requirement.test(formData.password);
  };

  const strengthInfo = getStrengthText(passwordStrength);

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
        {/* Password Section */}
        <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-full bg-blue-800/20 text-blue-400">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-medium text-blue-200">
              Create Secure Password
            </h3>
          </div>

          <div className="space-y-3">
            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-blue-200 text-xs">
                Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                    "password"
                  )} text-white placeholder:text-blue-300/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {touched.password && errors.password && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
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
              {touched.password && errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-300">
                    Password strength:
                  </span>
                  <span className={`text-xs font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-blue-900/50">
                  <div
                    className={cn("h-full", getStrengthColor(passwordStrength))}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-blue-200 text-xs"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`pl-10 h-9 w-full rounded-md transition-all duration-200 bg-[#081029] ${getInputBorderClass(
                    "confirmPassword"
                  )} text-white placeholder:text-blue-300/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
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
              {touched.confirmPassword && errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-900/40 rounded-md p-2.5 space-y-1.5">
              <p className="text-xs font-medium text-blue-200 mb-1.5">
                Password requirements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2 text-xs">
                    <div
                      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        requirementPasses(req)
                          ? "bg-green-900/30 text-green-400"
                          : "bg-blue-900/50 text-blue-400/50"
                      }`}
                    >
                      {requirementPasses(req) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                    <span
                      className={
                        requirementPasses(req)
                          ? "text-green-300"
                          : "text-blue-300/70"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
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
            A secure password helps protect your account from unauthorized
            access.
          </p>
        </div>
      </div>
    </form>
  );
};

export default PasswordForm;
