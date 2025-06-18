import { ReactNode } from "react";
import {
  FileX,
  FileQuestion,
  Database,
  List,
  BarChart,
  AlertCircle,
  Layers,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  className?: string;
  actionClassName?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  className = "",
  actionClassName = "bg-blue-600 hover:bg-blue-700",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-10 ${className}`}>
      <div className="mb-4 bg-blue-900/30 p-4 rounded-full inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-blue-300">{title}</h3>
      <div className="text-blue-400/70 mt-1">{description}</div>
      {actionLabel && onAction && (
        <Button className={`mt-4 ${actionClassName}`} onClick={onAction}>
          {actionIcon && <span className="mr-2">{actionIcon}</span>}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
