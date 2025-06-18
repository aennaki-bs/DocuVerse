import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, Key, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import PasswordStrengthIndicator from "../password/PasswordStrengthIndicator";

interface PasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  passwordStrength: number;
}

const PasswordFields: React.FC<PasswordFieldsProps> = ({
  password,
  confirmPassword,
  onChange,
  localErrors,
  passwordStrength,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine if fields are valid, have errors, or are empty
  const hasPasswordError = !!localErrors.password;
  const hasConfirmError = !!localErrors.confirmPassword;

  const isPasswordValid =
    password && !hasPasswordError && passwordStrength >= 3;
  const isConfirmValid =
    confirmPassword && password === confirmPassword && !hasConfirmError;

  return (
    <>
      <div className="space-y-1.5">
        <label
          className="block text-white text-sm font-medium mb-1"
          htmlFor="password"
        >
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-400" />
            <span>Create new password</span>
          </div>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create new password"
            className={`bg-[#0a1223] border-gray-800/20 h-10 sm:h-11 text-white rounded-lg pl-10 pr-12 focus:border-blue-500 focus:ring-blue-500/20 text-sm ${
              hasPasswordError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }`}
            value={password}
            onChange={onChange}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {isPasswordValid && (
            <CheckCircle2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.password && (
          <p className="text-xs text-red-500 mt-1">{localErrors.password}</p>
        )}
        <PasswordStrengthIndicator
          strength={passwordStrength}
          password={password}
        />
      </div>

      <div className="space-y-1.5 mt-4">
        <label
          className="block text-white text-sm font-medium mb-1"
          htmlFor="confirmPassword"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span>Confirm password</span>
          </div>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            className={`bg-[#0a1223] border-gray-800/20 h-10 sm:h-11 text-white rounded-lg pl-10 pr-12 focus:border-blue-500 focus:ring-blue-500/20 text-sm ${
              hasConfirmError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }`}
            value={confirmPassword}
            onChange={onChange}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {isConfirmValid && (
            <CheckCircle2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">
            {localErrors.confirmPassword}
          </p>
        )}
      </div>
    </>
  );
};

export default PasswordFields;
