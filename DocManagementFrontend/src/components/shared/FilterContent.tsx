import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface FilterContentProps {
  title?: string;
  children: ReactNode;
  onClearAll: () => void;
  onApply: () => void;
}

export function FilterContent({
  title = "Filter",
  children,
  onClearAll,
  onApply,
}: FilterContentProps) {
  return (
    <div>
      <div className="mb-2 text-blue-200 font-semibold">{title}</div>
      <div className="space-y-4">
        {children}

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-blue-300 border-blue-900/40 hover:bg-blue-800/40"
          >
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={onApply}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
