import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface CreateCircuitStepOneProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onNext: () => void;
  onCancel: () => void;
}

export default function CreateCircuitStepOne({
  value,
  onChange,
  error,
  disabled,
  onNext,
  onCancel,
}: CreateCircuitStepOneProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="title-step"
          className="text-blue-100 font-medium text-sm"
        >
          Circuit Title <span className="text-red-400">*</span>
        </Label>
        <div>
          <Input
            type="text"
            id="title-step"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter circuit title"
            autoFocus
            className="bg-[#0a1033]/80 border-blue-800/80 text-blue-100 placeholder:text-blue-400/70 focus:border-blue-500 focus:ring-blue-500/50 h-11 w-full rounded-md shadow-inner"
          />
          {error && (
            <div className="flex items-center mt-1.5 text-red-400 text-xs">
              <X className="h-3.5 w-3.5 mr-1" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <p className="text-blue-300/70 text-xs">
          Choose a descriptive title for your circuit to easily identify it
          later.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={disabled}
          className="border-blue-800/50 bg-transparent text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={disabled || !value.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-900/50 min-w-[100px]"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
