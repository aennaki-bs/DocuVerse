import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/document/DatePickerInput";
import { Calendar, Info, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

interface DateContabilityStepProps {
  docDate: string;
  dateError: string | null;
  onDateChange: (date: Date | undefined) => void;
  contabilityEnabled: boolean;
  onContabilityChange: (enabled: boolean) => void;
}

export const DateContabilityStep = ({
  docDate,
  dateError,
  onDateChange,
  contabilityEnabled,
  onContabilityChange,
}: DateContabilityStepProps) => {
  const [dateObj, setDateObj] = useState<Date>(() => {
    try {
      return new Date(docDate);
    } catch (e) {
      console.error("Error parsing docDate:", e);
      return new Date();
    }
  });

  // Update dateObj when docDate changes
  useEffect(() => {
    try {
      setDateObj(new Date(docDate));
    } catch (e) {
      console.error("Error updating dateObj:", e);
    }
  }, [docDate]);

  const handleDateChange = (date: Date | undefined) => {
    console.log("DateContabilityStep received date change:", date);
    onDateChange(date);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="docDate"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <Calendar className="h-4 w-4 text-blue-400" />
          Document Date*
        </Label>

        <DatePickerInput
          date={dateObj}
          onDateChange={handleDateChange}
          error={!!dateError}
        />

        {dateError && <p className="text-sm text-red-500">{dateError}</p>}
      </div>

      <Card className="bg-blue-900/20 border-blue-800/40">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 mt-0.5 text-blue-400" />
            <div>
              <h4 className="text-sm font-medium text-blue-400">
                Document Date Information
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                The document date determines when this document is considered
                effective. It will be used to filter available document types
                and subtypes in the next step.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 border-t border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-400" />
              Enable Contability
            </Label>
            <p className="text-xs text-gray-400">
              Track financial records and accounting information for this
              document
            </p>
          </div>
          <Switch
            checked={contabilityEnabled}
            onCheckedChange={onContabilityChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      {contabilityEnabled && (
        <Card className="bg-green-900/20 border-green-800/40 mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-green-400" />
              <div>
                <h4 className="text-sm font-medium text-green-400">
                  Contability Enabled
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  This document will be included in financial reports and
                  accounting records. The accounting date will be set to the
                  document date ({format(new Date(docDate), "MMMM d, yyyy")}).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
