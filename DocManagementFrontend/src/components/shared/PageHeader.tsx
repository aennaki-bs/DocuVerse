import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-card border-border rounded-lg p-6 mb-6 transition-all shadow-md",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground flex items-center">
            {icon && <span className="mr-3">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}
