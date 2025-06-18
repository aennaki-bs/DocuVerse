import React from "react";
import {
  EnhancedButton,
  EnhancedButtonProps,
} from "@/components/ui/enhanced-button";
import {
  ArrowRight,
  ChevronLeft,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";

export interface RegisterButtonProps extends Omit<EnhancedButtonProps, "type"> {
  buttonType: "next" | "back" | "submit" | "finish";
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({
  buttonType,
  loading,
  loadingText,
  children,
  fullWidth = false,
  ...props
}) => {
  const getButtonConfig = () => {
    switch (buttonType) {
      case "next":
        return {
          variant: "premium" as const,
          size: "lg" as const,
          rounded: "lg" as const,
          animation: "shimmer" as const,
          trailingIcon: <ArrowRight className="ml-1 h-5 w-5" />,
          className:
            "text-white font-medium shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none",
          fullWidth,
          loadingText: loadingText || "Processing...",
        };
      case "back":
        return {
          variant: "outline" as const,
          size: "lg" as const,
          rounded: "lg" as const,
          leadingIcon: <ArrowLeft className="mr-1 h-5 w-5" />,
          className:
            "border-blue-900/30 bg-[#182138] hover:bg-blue-900/40 text-blue-300 hover:text-blue-200 shadow-md",
          fullWidth,
        };
      case "submit":
        return {
          variant: "glow" as const,
          size: "lg" as const,
          rounded: "lg" as const,
          animation: "shimmer" as const,
          trailingIcon: <Check className="ml-1 h-5 w-5" />,
          className:
            "text-white font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-none shadow-lg",
          fullWidth,
          loadingText: loadingText || "Submitting...",
        };
      case "finish":
        return {
          variant: "success" as const,
          size: "lg" as const,
          rounded: "lg" as const,
          animation: "shimmer" as const,
          trailingIcon: <Check className="ml-1 h-5 w-5" />,
          className: "text-white font-medium shadow-lg",
          fullWidth,
          loadingText: loadingText || "Completing...",
        };
      default:
        return {
          variant: "default" as const,
          size: "lg" as const,
          fullWidth,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <EnhancedButton
      type="button"
      isLoading={loading}
      {...buttonConfig}
      {...props}
    >
      {children}
    </EnhancedButton>
  );
};

export default RegisterButton;
