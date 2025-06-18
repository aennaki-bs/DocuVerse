import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CreateCircuitStepTwoProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function CreateCircuitStepTwo({
  value,
  onChange,
  disabled,
  onNext,
  onBack,
}: CreateCircuitStepTwoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="descriptif-step"
          className="text-blue-100 font-medium text-sm"
        >
          Description
        </Label>
        <Textarea
          id="descriptif-step"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter circuit description (optional)"
          disabled={disabled}
          className="bg-[#0a1033]/80 border-blue-800/80 text-blue-100 placeholder:text-blue-400/70 focus:border-blue-500 focus:ring-blue-500/50 min-h-[120px] w-full rounded-md resize-none shadow-inner"
          style={{ borderColor: "rgb(30 58 138 / 0.8)" }}
        />
        <p className="text-blue-300/70 text-xs">
          Add details about the purpose and usage of this circuit. This will
          help users understand when to use it.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={disabled}
          className="border-blue-800/50 bg-transparent text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-900/50 min-w-[100px]"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
