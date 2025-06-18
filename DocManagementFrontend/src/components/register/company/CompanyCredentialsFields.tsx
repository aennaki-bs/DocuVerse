import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PasswordStrengthIndicator from "@/components/register/password/PasswordStrengthIndicator";

interface CompanyCredentialsFieldsProps {
  formData: {
    companyEmail: string;
    username: string;
    password: string;
    confirmPassword: string;
  };
  localErrors: Record<string, string>;
  validationErrors: {
    username?: string;
    email?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  passwordStrength: number;
}

const CompanyCredentialsFields: React.FC<CompanyCredentialsFieldsProps> = ({
  formData,
  localErrors,
  validationErrors,
  handleChange,
  passwordStrength,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Helper function to determine if a field is valid
  const isFieldValid = (fieldName: string, value?: string) => {
    return (
      value &&
      value.trim().length > 0 &&
      !localErrors[fieldName] &&
      !validationErrors[fieldName]
    );
  };

  const hasFieldError = (fieldName: string) => {
    return !!localErrors[fieldName] || !!validationErrors[fieldName];
  };

  return (
    <div className="space-y-5">
      {/* Company Email */}
      <div className="space-y-1">
        <Label htmlFor="email">Company Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="yourcompany@example.com"
            className="pl-10 pr-10"
            error={hasFieldError("email")}
            value={formData.companyEmail || ""}
            onChange={handleChange}
          />
          {hasFieldError("email") ? (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
          ) : (
            isFieldValid("email", formData.companyEmail) && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )
          )}
        </div>
        {(localErrors.email || validationErrors.email) && (
          <p className="text-xs text-red-500">
            {localErrors.email || validationErrors.email}
          </p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-1">
        <Label htmlFor="username">Company Username</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            name="username"
            placeholder="company_username"
            className="pl-10 pr-10"
            error={hasFieldError("username")}
            value={formData.username || ""}
            onChange={handleChange}
          />
          {hasFieldError("username") ? (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
          ) : (
            isFieldValid("username", formData.username) && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )
          )}
        </div>
        {(localErrors.username || validationErrors.username) && (
          <p className="text-xs text-red-500">
            {localErrors.username || validationErrors.username}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Username must be at least 4 characters
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            error={!!localErrors.password}
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
        {localErrors.password && (
          <p className="text-xs text-red-500">{localErrors.password}</p>
        )}

        {formData.password && (
          <PasswordStrengthIndicator strength={passwordStrength} />
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10"
            error={!!localErrors.confirmPassword}
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
        {localErrors.confirmPassword && (
          <p className="text-xs text-red-500">{localErrors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyCredentialsFields;
