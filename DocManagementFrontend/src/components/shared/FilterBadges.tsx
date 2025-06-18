import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export interface FilterBadge {
  id: string;
  label: string;
  value: string;
  icon?: ReactNode;
  onRemove: () => void;
}

interface FilterBadgesProps {
  badges: FilterBadge[];
  className?: string;
}

export function FilterBadges({ badges, className = "" }: FilterBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 mb-4 ${className}`}>
      {badges.map((badge) => (
        <Badge
          key={badge.id}
          variant="outline"
          className="bg-blue-900/20 text-blue-300 border-blue-500/30 flex gap-1 items-center"
        >
          {badge.icon && <span className="mr-1">{badge.icon}</span>}
          {badge.label}: {badge.value}
          <button onClick={badge.onRemove} className="ml-1 hover:text-blue-200">
            ×
          </button>
        </Badge>
      ))}
    </div>
  );
}
