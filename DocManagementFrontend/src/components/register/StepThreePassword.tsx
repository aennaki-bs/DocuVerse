import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";

// Password component with strength meter
const PasswordForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get strength text
  const getStrengthText = (
    strength: number
  ): { text: string; color: string } => {
    if (strength < 40) return { text: "Weak", color: "text-red-500" };
    if (strength < 80) return { text: "Good", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Update password strength when password changes
    if (name === "passwordHash") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Check passwords match when confirm password changes
    if (name === "confirmPassword" && value && formData.passwordHash) {
      if (value !== formData.passwordHash) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    // Check passwords match when password changes if confirm password is not empty
    if (name === "passwordHash" && formData.confirmPassword) {
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

    if (name === "passwordHash") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters";
      } else if (calculatePasswordStrength(value) < 60) {
        error = "Password is too weak";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        error = "Please confirm your password";
      } else if (value !== formData.passwordHash) {
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
    if (!formData.passwordHash) {
      newErrors.passwordHash = "Password is required";
      isValid = false;
    } else if (formData.passwordHash.length < 8) {
      newErrors.passwordHash = "Password must be at least 8 characters";
      isValid = false;
    } else if (calculatePasswordStrength(formData.passwordHash) < 60) {
      newErrors.passwordHash = "Password is too weak";
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.confirmPassword !== formData.passwordHash) {
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
      passwordHash: true,
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
    return formData.passwordHash && requirement.test(formData.passwordHash);
  };

  const strengthInfo = getStrengthText(passwordStrength);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Password Field */}
        <div>
          <Label
            htmlFor="passwordHash"
            className="flex items-center gap-1 mb-1.5"
          >
            <Lock className="h-3.5 w-3.5 text-blue-500" />
            Create Password
          </Label>
          <div className="relative">
            <Input
              id="passwordHash"
              name="passwordHash"
              type={showPassword ? "text" : "password"}
              value={formData.passwordHash || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a strong password"
              className={
                errors.passwordHash && touched.passwordHash
                  ? "border-red-300 pr-10"
                  : "pr-10"
              }
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1} // Prevent tab focus
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.passwordHash && touched.passwordHash && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1"
            >
              {errors.passwordHash}
            </motion.p>
          )}

          {/* Password strength meter */}
          {formData.passwordHash && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Strength</span>
                <span className={strengthInfo.color}>{strengthInfo.text}</span>
              </div>
              <Progress
                value={passwordStrength}
                className={`h-1.5 ${getStrengthColor(passwordStrength)}`}
              />
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <Label
            htmlFor="confirmPassword"
            className="flex items-center gap-1 mb-1.5"
          >
            <Lock className="h-3.5 w-3.5 text-blue-500" />
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              className={
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-300 pr-10"
                  : "pr-10"
              }
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1} // Prevent tab focus
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Password Requirements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {passwordRequirements.map((req) => (
              <div key={req.id} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    requirementPasses(req) ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {requirementPasses(req) ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <span
                  className={`text-xs ${
                    requirementPasses(req) ? "text-green-700" : "text-gray-600"
                  }`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
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

export default PasswordForm;
