import React from "react";
import { EnhancedButton } from "./enhanced-button";
import {
  Plus,
  ArrowRight,
  Check,
  Heart,
  Star,
  Zap,
  Download,
} from "lucide-react";

export interface ButtonShowcaseProps {
  title?: string;
  description?: string;
  showAnimations?: boolean;
  showSizes?: boolean;
  showVariants?: boolean;
  showRounded?: boolean;
  className?: string;
}

export function ButtonShowcase({
  title = "Button Variants",
  description = "A showcase of button styles and animations available in the application.",
  showAnimations = true,
  showSizes = true,
  showVariants = true,
  showRounded = true,
  className,
}: ButtonShowcaseProps) {
  const variants = [
    {
      name: "Default",
      value: "default",
      icon: <ArrowRight className="h-4 w-4" />,
    },
    { name: "Premium", value: "premium", icon: <Star className="h-4 w-4" /> },
    { name: "Success", value: "success", icon: <Check className="h-4 w-4" /> },
    { name: "Warning", value: "warning", icon: <Zap className="h-4 w-4" /> },
    {
      name: "Destructive",
      value: "destructive",
      icon: <Heart className="h-4 w-4" />,
    },
    { name: "Outline", value: "outline", icon: <Plus className="h-4 w-4" /> },
    { name: "Ghost", value: "ghost", icon: <Download className="h-4 w-4" /> },
    { name: "Frost", value: "frost", icon: <ArrowRight className="h-4 w-4" /> },
    { name: "Glass", value: "glass", icon: <ArrowRight className="h-4 w-4" /> },
    { name: "Neon", value: "neon", icon: <ArrowRight className="h-4 w-4" /> },
  ];

  const animations = [
    { name: "None", value: "none" },
    { name: "Pulse", value: "pulse" },
    { name: "Bounce", value: "bounce" },
    { name: "Shimmer", value: "shimmer" },
    { name: "Ripple", value: "ripple" },
    { name: "Pulsate", value: "pulsate" },
  ];

  const sizes = [
    { name: "Small", value: "sm" },
    { name: "Default", value: "default" },
    { name: "Medium", value: "md" },
    { name: "Large", value: "lg" },
    { name: "Extra Large", value: "xl" },
    { name: "XXL", value: "xxl" },
  ];

  const roundedOptions = [
    { name: "Default", value: "default" },
    { name: "Medium", value: "md" },
    { name: "Large", value: "lg" },
    { name: "Extra Large", value: "xl" },
    { name: "Full", value: "full" },
  ];

  return (
    <div className={className}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>

      {showVariants && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">
            Button Variants
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {variants.map((variant) => (
              <div key={variant.value} className="flex flex-col items-center">
                <EnhancedButton
                  variant={variant.value as any}
                  leadingIcon={variant.icon}
                  className="mb-2 w-full"
                >
                  {variant.name}
                </EnhancedButton>
                <span className="text-xs text-gray-500">{variant.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAnimations && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">
            Button Animations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {animations.map((animation) => (
              <div key={animation.value} className="flex flex-col items-center">
                <EnhancedButton
                  variant="premium"
                  animation={animation.value as any}
                  className="mb-2 w-full"
                >
                  {animation.name}
                </EnhancedButton>
                <span className="text-xs text-gray-500">{animation.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSizes && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">
            Button Sizes
          </h3>
          <div className="flex flex-wrap items-end gap-4">
            {sizes.map((size) => (
              <div key={size.value} className="flex flex-col items-center">
                <EnhancedButton
                  variant="default"
                  size={size.value as any}
                  className="mb-2"
                >
                  {size.name}
                </EnhancedButton>
                <span className="text-xs text-gray-500">{size.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRounded && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">
            Button Corners
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roundedOptions.map((option) => (
              <div key={option.value} className="flex flex-col items-center">
                <EnhancedButton
                  variant="frost"
                  rounded={option.value as any}
                  className="mb-2 w-full"
                >
                  {option.name}
                </EnhancedButton>
                <span className="text-xs text-gray-500">{option.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4 text-blue-300">
          Loading States
        </h3>
        <div className="flex flex-wrap gap-4">
          <EnhancedButton variant="default" isLoading={true}>
            Loading Default
          </EnhancedButton>
          <EnhancedButton
            variant="premium"
            isLoading={true}
            loadingText="Processing..."
          >
            With Text
          </EnhancedButton>
          <EnhancedButton variant="success" isLoading={true} size="lg">
            Large Loading
          </EnhancedButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-300">
          Icon Buttons
        </h3>
        <div className="flex flex-wrap gap-4">
          <EnhancedButton variant="default" size="icon">
            <Plus className="h-4 w-4" />
          </EnhancedButton>
          <EnhancedButton variant="premium" size="icon-sm">
            <Star className="h-4 w-4" />
          </EnhancedButton>
          <EnhancedButton variant="frost" size="icon-lg">
            <Download className="h-6 w-6" />
          </EnhancedButton>
          <EnhancedButton variant="neon" size="icon" rounded="full">
            <Zap className="h-4 w-4" />
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
}
