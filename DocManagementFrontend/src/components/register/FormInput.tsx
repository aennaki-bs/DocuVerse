import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  showSuccessIndicator?: boolean;
  isSuccess?: boolean;
  isLoading?: boolean;
  showLabelAnimation?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      type,
      error,
      icon,
      showSuccessIndicator,
      isSuccess,
      isLoading,
      showLabelAnimation,
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative">
        {/* Floating Label Animation */}
        {showLabelAnimation && placeholder && (
          <label
            htmlFor={id}
            className={cn(
              "absolute left-10 transition-all duration-200 pointer-events-none",
              isFocused || hasValue
                ? "-top-2 text-xs text-blue-400 bg-[#081029] px-1 z-10"
                : "top-2.5 text-sm text-blue-300/70"
            )}
          >
            {placeholder}
          </label>
        )}

        {/* Input Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md transition-all duration-200",
            "bg-[#081029] border border-blue-900/50 text-white",
            "placeholder:text-blue-300/50 focus:border-blue-500/50",
            isFocused
              ? "shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]"
              : "",
            error
              ? "border-red-500/70 shadow-[0_0_0_1px_rgba(239,68,68,0.3)]"
              : "",
            icon ? "pl-10" : "px-3",
            showLabelAnimation && (isFocused || hasValue)
              ? "pt-4 pb-1"
              : "py-2.5",
            className
          )}
          placeholder={showLabelAnimation ? " " : placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          ref={ref}
          id={id}
          {...props}
        />

        {/* Success/Error/Loading Indicator */}
        {showSuccessIndicator && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <svg
                className="animate-spin h-4 w-4 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : isSuccess ? (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 15, 0] }}
                className="h-4 w-4 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </motion.svg>
            ) : error ? (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 15, 0] }}
                className="h-4 w-4 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </motion.svg>
            ) : null}
          </div>
        )}

        {/* ERP circuit decoration */}
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-2 left-3 right-3 h-[1px] z-10 overflow-hidden"
          >
            <svg
              width="100%"
              height="3"
              viewBox="0 0 100 3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x="0"
                y1="1"
                x2="100"
                y2="1"
                stroke="rgba(59,130,246,0.6)"
                strokeWidth="0.5"
                strokeDasharray="1,3"
              />
              <motion.circle
                cx="0"
                cy="1"
                r="1"
                fill="rgba(59,130,246,0.8)"
                animate={{
                  cx: [0, 100],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
              />
            </svg>
          </motion.div>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
