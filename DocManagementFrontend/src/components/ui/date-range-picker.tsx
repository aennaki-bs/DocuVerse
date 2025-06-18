import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
  align?: "center" | "start" | "end";
  children?: React.ReactNode;
  disabled?: boolean;
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  align = "start",
  children,
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          {children || (
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-auto justify-start text-left font-normal bg-blue-900/20 border-blue-800/30 hover:bg-blue-900/30",
                !date && "text-blue-300/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM d, yyyy")} -{" "}
                    {format(date.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(date.from, "MMM d, yyyy")
                )
              ) : (
                <span>Filter by date</span>
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30"
          align={align}
          sideOffset={4}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            className="bg-white text-blue-900 dark:bg-[#0a1033] dark:text-white"
          />
          <div className="p-3 border-t border-blue-900/30 flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(undefined)}
              className="border-blue-800/50 text-blue-300 hover:bg-blue-900/30"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => document.body.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
