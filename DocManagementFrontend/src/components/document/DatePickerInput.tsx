import * as React from "react";
import { format, isValid, parse, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerInputProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  error?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePickerInput({
  date,
  onDateChange,
  error,
  minDate,
  maxDate,
}: DatePickerInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(() => {
    try {
      return format(date, "MM/dd/yyyy");
    } catch (e) {
      console.error("Error formatting date:", e);
      return format(new Date(), "MM/dd/yyyy");
    }
  });
  const [inputError, setInputError] = React.useState(false);

  React.useEffect(() => {
    try {
      setInputValue(format(date, "MM/dd/yyyy"));
      setInputError(false);
    } catch (e) {
      console.error("Error updating date in effect:", e);
    }
  }, [date]);

  const validateDateRange = (date: Date): boolean => {
    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    if (minDate) {
      const normalizedMinDate = new Date(minDate);
      normalizedMinDate.setHours(0, 0, 0, 0);
      if (normalizedDate < normalizedMinDate) {
        return false;
      }
    }

    if (maxDate) {
      const normalizedMaxDate = new Date(maxDate);
      normalizedMaxDate.setHours(0, 0, 0, 0);
      if (normalizedDate > normalizedMaxDate) {
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Only process if it matches the MM/DD/YYYY pattern
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(newValue)) {
      const parsedDate = parse(newValue, "MM/dd/yyyy", new Date());

      if (isValid(parsedDate)) {
        // Check if date is within allowed range
        if (validateDateRange(parsedDate)) {
          setInputError(false);
          onDateChange(parsedDate);
        } else {
          setInputError(true);
        }
      } else {
        setInputError(true);
      }
    } else if (newValue.length === 10) {
      // If it has the right length but wrong format, show an error
      setInputError(true);
    }
  };

  const handleInputBlur = () => {
    // If the input is empty or invalid when the user leaves, reset to the current valid date
    if (inputValue.trim() === "" || inputError) {
      try {
        setInputValue(format(date, "MM/dd/yyyy"));
        setInputError(false);
      } catch (e) {
        console.error("Error in handleInputBlur:", e);
      }
    }
  };

  // Format as user types to help with date entry
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const { value, selectionStart } = input;

    // Only allow digits, backspace, delete, arrow keys, and tab
    if (
      !/^\d$/.test(event.key) &&
      event.key !== "Backspace" &&
      event.key !== "Delete" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Tab"
    ) {
      event.preventDefault();
      return;
    }

    // Auto-insert slashes for MM/DD/YYYY format
    if (/^\d$/.test(event.key)) {
      if (value.length === 2 || value.length === 5) {
        if (selectionStart === value.length) {
          event.preventDefault();
          const newValue = value + "/" + event.key;
          setInputValue(newValue);
        }
      }
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        placeholder="MM/DD/YYYY"
        maxLength={10}
        className={cn(
          "pr-10 bg-gray-900 border-gray-800 text-white h-12 text-base",
          error || inputError ? "border-red-500" : ""
        )}
      />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-800"
            )}
            onClick={() => setIsPopoverOpen(true)}
          >
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-gray-900 border border-gray-800"
          align="end"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                console.log("Calendar date selected:", newDate);
                onDateChange(newDate);
                setIsPopoverOpen(false);
              }
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto bg-gray-900 text-white")}
            fromDate={minDate}
            toDate={maxDate}
            disabled={(dateToCheck) => {
              // Normalize the date to avoid timezone issues
              const normalizedDate = new Date(dateToCheck);
              normalizedDate.setHours(0, 0, 0, 0);

              if (minDate) {
                const normalizedMinDate = new Date(minDate);
                normalizedMinDate.setHours(0, 0, 0, 0);
                if (normalizedDate < normalizedMinDate) return true;
              }

              if (maxDate) {
                const normalizedMaxDate = new Date(maxDate);
                normalizedMaxDate.setHours(0, 0, 0, 0);
                if (normalizedDate > normalizedMaxDate) return true;
              }

              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
