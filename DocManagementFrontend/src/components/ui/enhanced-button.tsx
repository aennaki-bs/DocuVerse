import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none relative group overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-600/0 after:via-white/20 after:to-blue-600/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:transform after:rotate-[30deg] after:scale-x-150 after:translate-x-[-150%] hover:after:translate-x-[150%]",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-red-600/0 after:via-white/20 after:to-red-600/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:transform after:rotate-[30deg] after:scale-x-150 after:translate-x-[-150%] hover:after:translate-x-[150%]",
        outline:
          "border border-blue-800/30 bg-blue-950/20 text-blue-300 hover:text-blue-50 backdrop-blur-sm hover:bg-blue-900/30 hover:border-blue-700/50 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-blue-900/30 text-blue-100 hover:bg-blue-800/40 border border-blue-800/50 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "bg-transparent text-blue-300 hover:bg-blue-900/30 hover:text-blue-50 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline p-0 h-auto",
        glow: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-600/0 after:via-white/20 after:to-blue-600/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:transform after:rotate-[30deg] after:scale-x-150 after:translate-x-[-150%] hover:after:translate-x-[150%]",
        premium:
          "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.7)] hover:scale-[1.03] active:scale-[0.98] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-indigo-600/0 after:via-white/20 after:to-indigo-600/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:transform after:rotate-[30deg] after:scale-x-150 after:translate-x-[-150%] hover:after:translate-x-[150%]",
        success:
          "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-500 hover:to-green-500 shadow-md hover:shadow-lg hover:shadow-emerald-800/20 hover:scale-[1.02] active:scale-[0.98] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-emerald-600/0 after:via-white/20 after:to-emerald-600/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:transform after:rotate-[30deg] after:scale-x-150 after:translate-x-[-150%] hover:after:translate-x-[150%]",
        warning:
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-md hover:shadow-lg hover:shadow-amber-800/20 hover:scale-[1.02] active:scale-[0.98] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-amber-500/0 after:via-white/20 after:to-amber-500/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:transform after:rotate-[30deg] after:scale-x-150 after:translate-x-[-150%] hover:after:translate-x-[150%]",
        frost:
          "border border-blue-500/20 bg-white/5 backdrop-blur-xl text-blue-100 hover:text-white hover:border-blue-400/30 hover:bg-white/10 shadow-sm hover:shadow-md hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]",
        glass:
          "border border-white/10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/20 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]",
        neon: "bg-black/30 border border-[#0ff]/30 text-[#0ff] shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] hover:border-[#0ff]/60 hover:text-white hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        md: "h-10 rounded-md px-4",
        lg: "h-11 rounded-md px-6 text-base",
        xl: "h-12 rounded-md px-8 text-base",
        xxl: "h-14 rounded-md px-10 text-lg",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
        "icon-lg": "h-12 w-12 rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      isLoading: {
        true: "cursor-wait",
        false: "",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        shimmer:
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-[shimmer_2s_infinite]",
        ripple:
          "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-[shimmer_2s_infinite]",
        pulsate:
          "animate-[pulsate_1.5s_ease-in-out_infinite] hover:animate-none",
      },
      rounded: {
        default: "rounded-md",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      isLoading: false,
      animation: "none",
      rounded: "default",
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  animation?: "none" | "pulse" | "bounce" | "shimmer" | "ripple" | "pulsate";
  rounded?: "default" | "md" | "lg" | "xl" | "full" | "none";
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      loadingText,
      leadingIcon,
      trailingIcon,
      asChild = false,
      fullWidth,
      animation = "none",
      rounded = "default",
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          enhancedButtonVariants({
            variant,
            size,
            isLoading,
            fullWidth,
            animation,
            rounded,
            className,
          })
        )}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!isLoading && leadingIcon}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && trailingIcon}
      </Comp>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };
