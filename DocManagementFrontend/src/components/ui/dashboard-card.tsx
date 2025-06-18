import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface DashboardCardProps {
  title?: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean;
  headerAction?: ReactNode;
}

export function DashboardCard({
  title,
  className,
  children,
  footer,
  noPadding = false,
  headerAction,
}: DashboardCardProps) {
  const { theme } = useTheme();
  const isStandardTheme = theme.variant === "standard";

  return (
    <Card
      className={cn(
        "border-border shadow-md overflow-hidden",
        isStandardTheme ? "glass-card" : "bg-card",
        className
      )}
    >
      {title && (
        <CardHeader
          className={cn(
            "border-b border-border px-4 py-3",
            isStandardTheme ? "bg-white/20 backdrop-blur-sm" : "bg-muted/50"
          )}
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("text-foreground", noPadding ? "p-0" : "p-4")}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter
          className={cn(
            "border-t border-border px-4 py-3",
            isStandardTheme ? "bg-white/10 backdrop-blur-sm" : "bg-muted/30"
          )}
        >
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
