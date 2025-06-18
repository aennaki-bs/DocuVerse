import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef, useRef } from "react";
import { format } from "date-fns";

interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onDateChange?: (date: Date | undefined) => void;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, onDateChange, value, ...props }, ref) => {
    // Create a hidden date input for the native date picker
    const hiddenDateInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (date: string) => {
      if (onDateChange) {
        if (!date) {
          onDateChange(undefined);
          return;
        }

        try {
          const newDate = new Date(date);
          if (!isNaN(newDate.getTime())) {
            onDateChange(newDate);
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }
    };

    const showDatePicker = () => {
      if (hiddenDateInputRef.current) {
        hiddenDateInputRef.current.showPicker &&
          hiddenDateInputRef.current.showPicker();
      }
    };

    // Format date for display
    const formatDisplayDate = (
      dateValue: string | number | readonly string[] | undefined
    ) => {
      if (!dateValue) return "";

      try {
        const date = new Date(dateValue.toString());
        if (!isNaN(date.getTime())) {
          return format(date, "MM/dd/yyyy");
        }
        return dateValue.toString();
      } catch (e) {
        return dateValue?.toString() || "";
      }
    };

    // Handle hidden input change
    const handleHiddenInputChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      handleChange(e.target.value);

      // Call the original onChange if it exists
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="flex rounded-md overflow-hidden border border-blue-200 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/30 hover:border-blue-300 transition-all dark:border-blue-900/50 dark:bg-[#0a1033] dark:hover:border-blue-700/60">
        {/* Visible text input (for display only) */}
        <input
          type="text"
          ref={ref}
          readOnly
          value={formatDisplayDate(value)}
          className={cn(
            "h-9 px-3 bg-transparent border-0 text-white text-xs w-full focus:outline-none focus:ring-0 cursor-pointer",
            className
          )}
          onClick={showDatePicker}
          placeholder={props.placeholder || "mm/dd/yyyy"}
          {...props}
          onChange={undefined} // Prevent onChange from being applied to this input
        />

        {/* Hidden date input (for the native date picker) */}
        <input
          type="date"
          ref={hiddenDateInputRef}
          value={typeof value === "string" ? value : ""}
          onChange={handleHiddenInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={showDatePicker}
          className="px-2 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
