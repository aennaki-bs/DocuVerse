import React from "react";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, AtSign, AlertCircle } from "lucide-react";

interface EmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  validationErrors: Record<string, string>;
}

const EmailField: React.FC<EmailFieldProps> = ({
  value,
  onChange,
  localErrors,
  validationErrors,
}) => {
  const hasError = !!(localErrors.email || validationErrors.email);
  const isValid = value && !hasError;

  return (
    <div className="space-y-1.5 w-full">
      <label
        className="block text-white text-sm font-medium mb-1.5"
        htmlFor="email"
      >
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-amber-400" />
          <span>Email Address</span>
        </div>
      </label>
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          <Mail className="h-4 w-4" />
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          className={`bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300 ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : isValid
              ? "border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20"
              : ""
          }`}
          value={value}
          onChange={onChange}
        />
        {hasError ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        ) : (
          isValid && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          )
        )}
      </div>
      {(localErrors.email || validationErrors.email) && (
        <p className="text-xs text-red-500 mt-1">
          {localErrors.email || validationErrors.email}
        </p>
      )}
    </div>
  );
};

export default EmailField;
