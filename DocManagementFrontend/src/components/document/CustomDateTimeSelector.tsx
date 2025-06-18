import * as React from "react";
import { format, isValid, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Calculator,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface CustomDateTimeSelectorProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string | null;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  isOptional?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function CustomDateTimeSelector({
  date,
  onChange,
  error,
  label,
  description,
  icon = <CalendarDays className="h-5 w-5" />,
  iconColor = "text-blue-500",
  isOptional = false,
  className,
  minDate,
  maxDate,
}: CustomDateTimeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(
    date || new Date()
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format the displayed date/time
  const getFormattedDateTime = () => {
    if (!date) return "Select date & time";
    return format(date, "MM/dd/yyyy");
  };

  // Handle calendar date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    // Preserve time if a date was already selected
    if (date) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      selectedDate.setHours(hours, minutes);
    } else {
      // Default to noon if no previous time
      selectedDate.setHours(12, 0);
    }

    onChange(selectedDate);
  };

  // Quick date selection options
  const quickDateOptions = [
    { label: "Today", value: new Date() },
    { label: "Tomorrow", value: addDays(new Date(), 1) },
    { label: "Next week", value: addDays(new Date(), 7) },
  ];

  // Common time options
  const timeOptions = [
    { label: "9:00 AM", hours: 9, minutes: 0 },
    { label: "12:00 PM", hours: 12, minutes: 0 },
    { label: "3:00 PM", hours: 15, minutes: 0 },
    { label: "5:00 PM", hours: 17, minutes: 0 },
  ];

  // Apply a time to the current date
  const applyTime = (hours: number, minutes: number) => {
    if (!date) {
      const newDate = new Date();
      newDate.setHours(hours, minutes);
      onChange(newDate);
    } else {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  // Clear date selection
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setIsOpen(false);
  };

  // Previous/next month navigation
  const prevMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setSelectedMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setSelectedMonth(newMonth);
  };

  // Check if there are date constraints
  const hasDateConstraints = minDate || maxDate;

  return (
    <div className={cn("mb-4", className)} ref={containerRef}>
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("", iconColor)}>{icon}</span>
          <Label className="text-base font-medium text-white">
            {label}
            {isOptional && (
              <span className="text-xs text-gray-400 ml-1">(Optional)</span>
            )}
          </Label>
          {hasDateConstraints && (
            <div className="ml-auto text-xs text-amber-400 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              <span>Date restrictions apply</span>
            </div>
          )}
        </div>

        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>

      <div className="relative">
        <div
          className={cn(
            "flex items-center justify-between w-full px-3 py-2.5 rounded-md border focus:outline-none cursor-pointer",
            isOpen
              ? "border-blue-600 bg-blue-900/20"
              : "border-gray-800 bg-gray-900/90 hover:border-gray-700",
            date ? "text-white" : "text-gray-400"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">
              {getFormattedDateTime()}
            </span>
          </div>
          <div className="flex items-center">
            {date && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-1 rounded-full hover:bg-gray-800 hover:text-red-400"
                onClick={clearSelection}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 opacity-50 transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
          </div>
        </div>

        {isOpen && (
          <Card className="absolute mt-1 w-full z-50 shadow-lg border-gray-700 bg-gray-900">
            <CardContent className="p-0 overflow-hidden">
              {/* Quick Date Selection */}
              <div className="p-2 border-b border-gray-800 grid grid-cols-3 gap-1.5">
                {quickDateOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-7 text-xs font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-700",
                      date &&
                        format(date, "yyyy-MM-dd") ===
                          format(option.value, "yyyy-MM-dd") &&
                        "bg-blue-900/40 border-blue-700 text-blue-300"
                    )}
                    onClick={() => handleDateSelect(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Calendar */}
              <div className="p-2 border-b border-gray-800">
                {/* Calendar Navigation */}
                <div className="px-2 py-1 flex justify-between items-center mb-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-800"
                    onClick={prevMonth}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <h3 className="text-xs font-medium text-gray-200">
                    {format(selectedMonth, "MMMM yyyy")}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-800"
                    onClick={nextMonth}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  disabled={(date) => {
                    if (minDate && date < minDate) return true;
                    if (maxDate && date > maxDate) return true;
                    return false;
                  }}
                  className="border-0 custom-calendar"
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-600",
                    day_today: "bg-gray-800 text-white",
                    day: "text-sm h-7 w-7 p-0 focus-visible:ring-blue-600",
                  }}
                />
              </div>

              {/* Time Selection */}
              <div className="p-2">
                <div className="text-xs font-medium text-gray-400 mb-2 px-1">
                  Select Time
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {timeOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-7 text-xs font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-700",
                        date &&
                          date.getHours() === option.hours &&
                          date.getMinutes() === option.minutes &&
                          "bg-blue-900/40 border-blue-700 text-blue-300"
                      )}
                      onClick={() => applyTime(option.hours, option.minutes)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Date constraints info */}
      {hasDateConstraints && (
        <div className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          <span>
            {minDate && maxDate
              ? `End date must be after start date (${format(
                  minDate,
                  "MM/dd/yyyy"
                )} - ${format(maxDate, "MM/dd/yyyy")})`
              : minDate
              ? `Date must be after ${format(minDate, "MM/dd/yyyy")}`
              : maxDate
              ? `Date must be before ${format(maxDate, "MM/dd/yyyy")}`
              : ""}
          </span>
        </div>
      )}
    </div>
  );
}
