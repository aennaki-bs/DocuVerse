import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showPassword: boolean;
  toggleVisibility: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  showPassword,
  toggleVisibility,
  className,
  ...props
}) => {
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={`bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10 ${
          className || ""
        }`}
        {...props}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-100 focus:outline-none"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
