import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  icon?: React.ReactNode;
  options: Array<{ value: string; label: string }>;
  showLabelAnimation?: boolean;
  placeholder?: string;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      className,
      error,
      icon,
      options,
      showLabelAnimation,
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      !!props.value && props.value !== ""
    );

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setHasValue(!!e.target.value && e.target.value !== "");
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
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 z-10">
            {icon}
          </div>
        )}

        <div className="relative">
          <select
            className={cn(
              "flex h-10 w-full rounded-md appearance-none transition-all duration-200",
              "bg-[#081029] border border-blue-900/50 text-white",
              "focus:border-blue-500/50",
              isFocused
                ? "shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_15px_rgba(59,130,246,0.1)]"
                : "",
              error
                ? "border-red-500/70 shadow-[0_0_0_1px_rgba(239,68,68,0.3)]"
                : "",
              icon ? "pl-10" : "pl-3",
              "pr-10",
              showLabelAnimation && (isFocused || hasValue)
                ? "pt-4 pb-1"
                : "py-2.5",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            ref={ref}
            id={id}
            {...props}
          >
            {placeholder && !showLabelAnimation && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isFocused ? "text-blue-400 rotate-180" : "text-blue-500/50"
              )}
            />
          </div>
        </div>

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

FormSelect.displayName = "FormSelect";

export { FormSelect };
