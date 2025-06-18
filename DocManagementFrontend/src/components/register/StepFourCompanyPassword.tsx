import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { toast } from "sonner";
import { validatePasswordStep } from "./utils/validation";
import { usePasswordStrength } from "./hooks/usePasswordStrength";
import StepContainer from "./utils/StepContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import PasswordStrengthIndicator from "./password/PasswordStrengthIndicator";

const StepFourCompanyPassword = () => {
  const { formData, setFormData, prevStep, nextStep } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { calculatePasswordStrength } = usePasswordStrength();
  const passwordStrength = calculatePasswordStrength(formData.password);

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

  // Validate on data change
  useEffect(() => {
    const errors = validatePasswordStep(formData);
    setLocalErrors(errors);
  }, [formData]);

  const validateStep = (showToast = true) => {
    const errors = validatePasswordStep(formData);

    // Set all fields as touched when user tries to proceed
    setTouchedFields({
      password: true,
      confirmPassword: true,
    });

    setLocalErrors(errors);

    if (showToast && Object.keys(errors).length > 0) {
      toast.error("Please correct all errors before proceeding");
    }

    return Object.keys(errors).length === 0;
  };

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach((key) => {
    if (touchedFields[key as keyof typeof touchedFields]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  const handleNext = () => {
    // Mark all fields as touched when user tries to proceed
    setTouchedFields({
      password: true,
      confirmPassword: true,
    });

    if (!validateStep()) {
      return;
    }

    nextStep();
  };

  return (
    <StepContainer onNext={handleNext} onBack={prevStep}>
      {/* Password */}
      <div className="space-y-1">
        <Label
          htmlFor="password"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <span>Password</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={!!visibleErrors.password}
            value={formData.password || ""}
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        {visibleErrors.password && (
          <p className="text-xs text-red-500">{visibleErrors.password}</p>
        )}

        {formData.password && (
          <PasswordStrengthIndicator
            strength={passwordStrength}
            password={formData.password}
          />
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Label
          htmlFor="confirmPassword"
          className="block text-white text-sm font-medium mb-1.5"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <span>Confirm Password</span>
          </div>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            error={!!visibleErrors.confirmPassword}
            value={formData.confirmPassword || ""}
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
            <span className="sr-only">
              {showConfirmPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        {visibleErrors.confirmPassword && (
          <p className="text-xs text-red-500">
            {visibleErrors.confirmPassword}
          </p>
        )}
      </div>
    </StepContainer>
  );
};

export default StepFourCompanyPassword;
