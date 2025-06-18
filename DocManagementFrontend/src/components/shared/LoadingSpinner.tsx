import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-12 w-12 border-2",
    lg: "h-16 w-16 border-3",
  };

  return (
    <div className="flex justify-center py-10">
      <div
        className={cn(
          "animate-spin rounded-full border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent",
          sizeClasses[size],
          className
        )}
      ></div>
    </div>
  );
}
