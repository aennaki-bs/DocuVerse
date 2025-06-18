import { SubType } from "@/models/subtype";
import { Calendar, Info, Calculator } from "lucide-react";
import { format, isValid } from "date-fns";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslation } from "@/hooks/useTranslation";

interface DateSelectionStepProps {
  docDate: string;
  comptableDate: string | null;
  dateError: string | null;
  comptableDateError: string | null;
  onDateChange: (date: Date | undefined) => void;
  onComptableDateChange: (date: Date | undefined) => void;
  selectedSubType?: SubType | null;
}

export const DateSelectionStep = ({
  docDate,
  comptableDate,
  dateError,
  comptableDateError,
  onDateChange,
  onComptableDateChange,
  selectedSubType,
}: DateSelectionStepProps) => {
  const { t, tWithParams } = useTranslation();
  
  // State for date values
  const [documentDate, setDocumentDate] = useState<Date | undefined>(() => {
    if (!docDate) return new Date();
    try {
      const parsed = new Date(docDate);
      return isValid(parsed) ? parsed : new Date();
    } catch (e) {
      console.error("Error parsing docDate:", e);
      return new Date();
    }
  });

  const [accountingDate, setAccountingDate] = useState<Date | undefined>(() => {
    if (!comptableDate) return undefined;
    try {
      const parsed = new Date(comptableDate);
      return isValid(parsed) ? parsed : undefined;
    } catch (e) {
      console.error("Error parsing comptableDate:", e);
      return undefined;
    }
  });

  // Refs for the date pickers
  const docDateRef = useRef<HTMLInputElement>(null);
  const accountingDateRef = useRef<HTMLInputElement>(null);

  // Update state when props change
  useEffect(() => {
    if (docDate) {
      try {
        const parsed = new Date(docDate);
        if (isValid(parsed)) {
          setDocumentDate(parsed);
        }
      } catch (e) {
        console.error("Error updating document date:", e);
      }
    }
  }, [docDate]);

  useEffect(() => {
    if (comptableDate) {
      try {
        const parsed = new Date(comptableDate);
        if (isValid(parsed)) {
          setAccountingDate(parsed);
        }
      } catch (e) {
        console.error("Error updating accounting date:", e);
      }
    } else {
      setAccountingDate(undefined);
    }
  }, [comptableDate]);

  // Calculate if the selected date is within the valid range
  const isDateValid = (() => {
    if (!selectedSubType || !documentDate) return true;

    try {
      // Create dates and normalize them to avoid timezone issues
      const selectedDate = new Date(documentDate);
      const startDate = new Date(selectedSubType.startDate);
      const endDate = new Date(selectedSubType.endDate);

      // Reset time components for accurate date comparison
      selectedDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Compare dates directly
      return selectedDate >= startDate && selectedDate <= endDate;
    } catch (error) {
      console.error("Date validation error:", error);
      return false;
    }
  })();

  // Format date for input
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Handle document date change
  const handleDocumentDateChange = (date: Date | undefined) => {
    setDocumentDate(date);
    onDateChange(date);
  };

  // Handle accounting date change
  const handleAccountingDateChange = (date: Date | undefined) => {
    setAccountingDate(date);
    onComptableDateChange(date);
  };

  return (
    <div className="space-y-6">
      {/* Document Date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h3 className="text-base font-medium text-white">{t("documents.documentDate")}</h3>
          </div>
          <span className="text-xs text-blue-300">{t("common.required")}</span>
        </div>

        <DatePicker
          ref={docDateRef}
          value={formatDateForInput(documentDate)}
          onDateChange={handleDocumentDateChange}
        />

        {dateError && (
          <div className="text-red-500 text-xs flex items-center gap-1.5 mt-1">
            <Info className="h-3.5 w-3.5" />
            <span>{dateError}</span>
          </div>
        )}

        {selectedSubType && !isDateValid && (
          <div className="text-xs text-amber-400 flex items-center gap-1.5 mt-1">
            <Info className="h-3.5 w-3.5" />
            <span>
              {t("documents.dateOutsideValidRange")}
            </span>
          </div>
        )}
      </div>

      {/* Date filtering information */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-md p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 mt-0.5 text-blue-400" />
          <div>
            <h4 className="text-sm font-medium text-blue-400">
              {t("documents.aboutDateSelection")}
            </h4>
            <p className="text-sm text-gray-300 mt-1">
              <strong>{t("common.important")}:</strong> {t("documents.importantDateInfo")}
            </p>
          </div>
        </div>
      </div>

      {/* Accounting Date Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-400" />
            <h3 className="text-base font-medium text-white">
              {t("documents.accountingDate")}
            </h3>
          </div>
          <span className="text-xs text-gray-400">({t("common.optional")})</span>
        </div>
        <p className="text-sm text-gray-400">
          {t("documents.accountingDateDescription")}
        </p>

        <DatePicker
          ref={accountingDateRef}
          value={formatDateForInput(accountingDate)}
          onDateChange={handleAccountingDateChange}
          placeholder={t("common.selectDate")}
        />

        {comptableDateError && (
          <div className="text-red-500 text-xs flex items-center gap-1.5 mt-1">
            <Info className="h-3.5 w-3.5" />
            <span>{comptableDateError}</span>
          </div>
        )}
      </div>

      {/* Valid Date Range Information */}
      {selectedSubType && (
        <div
          className={`bg-opacity-20 border rounded-md p-4 ${
            isDateValid
              ? "bg-blue-900/20 border-blue-800"
              : "bg-amber-900/20 border-amber-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <Info
              className={`h-5 w-5 mt-0.5 ${
                isDateValid ? "text-blue-400" : "text-amber-400"
              }`}
            />
            <div>
              <h4
                className={`text-sm font-medium ${
                  isDateValid ? "text-blue-400" : "text-amber-400"
                }`}
              >
                {tWithParams("documents.validDateRangeFor", { subType: selectedSubType.subTypeKey })}
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                {t("documents.documentsOfThisSubtypeMustHaveDate")}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-white font-medium">
                    {format(
                      new Date(selectedSubType.startDate),
                      "MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-400">{t("common.to")}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-white font-medium">
                    {format(new Date(selectedSubType.endDate), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>

              {!isDateValid && (
                <p className="text-amber-400 text-sm mt-3 font-medium">
                  {t("documents.selectedDateOutsideRange")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
