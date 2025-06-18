import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, InfoIcon } from "lucide-react";
import { FormValues } from "../StatusFormDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatusFormStepThreeProps {
  values: FormValues;
  onChange: (key: keyof FormValues, value: boolean) => void;
  disabled?: boolean;
  onEdit: (step: 1 | 2) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  existingInitialStatus: boolean;
  existingFinalStatus: boolean;
  isCircuitStatus: boolean;
}

export default function StatusFormStepThree({
  values,
  onChange,
  disabled,
  onEdit,
  onBack,
  onSubmit,
  isSubmitting,
  existingInitialStatus,
  existingFinalStatus,
  isCircuitStatus,
}: StatusFormStepThreeProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {isCircuitStatus && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isInitial"
                checked={values.isInitial}
                onCheckedChange={(checked) => onChange("isInitial", !!checked)}
                disabled={
                  disabled || (existingInitialStatus && !values.isInitial)
                }
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Label
                htmlFor="isInitial"
                className="cursor-pointer text-blue-200"
              >
                Initial status
              </Label>
            </div>

            {existingInitialStatus && !values.isInitial && (
              <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-300 py-2 px-3">
                <InfoIcon className="h-4 w-4 mr-2 text-blue-400" />
                <AlertDescription className="text-xs">
                  Another status is already set as initial. Only one initial
                  status is allowed per circuit.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFinal"
                checked={values.isFinal}
                onCheckedChange={(checked) => onChange("isFinal", !!checked)}
                disabled={disabled || (existingFinalStatus && !values.isFinal)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="isFinal" className="cursor-pointer text-blue-200">
                Final status
              </Label>
            </div>

            {existingFinalStatus && !values.isFinal && (
              <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-300 py-2 px-3">
                <InfoIcon className="h-4 w-4 mr-2 text-blue-400" />
                <AlertDescription className="text-xs">
                  Another status is already set as final. Only one final status
                  is allowed per circuit.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>

      <div className="bg-[#171f3c] rounded-lg p-3 text-blue-200 mt-4">
        <div className="flex flex-col gap-2">
          <div>
            <span className="font-semibold">Title:</span>
            <span className="ml-2 text-blue-100">{values.title}</span>
          </div>
          <div>
            <span className="font-semibold">Description:</span>
            <span className="ml-2 text-blue-300">
              {values.description?.trim() ? (
                values.description
              ) : (
                <span className="italic text-gray-400">No description</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={disabled || isSubmitting}
          className="border-blue-800/50 bg-transparent text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !values.title}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-900/50 min-w-[130px]"
        >
          {isSubmitting ? (
            <>
              Creating <Check className="ml-1 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Create Status <Check className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
