import * as React from "react";
import {
  format,
  isValid,
  parse,
  addDays,
  setHours,
  setMinutes,
} from "date-fns";
import {
  CalendarIcon,
  Clock,
  ChevronDown,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  error?: string | null;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  showTimeSelector?: boolean;
  isOptional?: boolean;
  optionalText?: string;
  iconColor?: string;
  icon?: React.ReactNode;
  className?: string;
  clearable?: boolean;
}

export function DateTimePicker({
  date,
  onDateChange,
  error,
  minDate,
  maxDate,
  placeholder = "Select date & time",
  showTimeSelector = true,
  isOptional = false,
  optionalText = "Optional",
  iconColor = "text-blue-400",
  icon = <CalendarIcon className="h-5 w-5" />,
  className,
  clearable = false,
}: DateTimePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>("calendar");

  // Time selection state
  const [hours, setHourValue] = React.useState<number>(
    date ? date.getHours() : 0
  );
  const [minutes, setMinuteValue] = React.useState<number>(
    date ? date.getMinutes() : 0
  );

  // Quick date options
  const quickDateOptions = [
    { label: "Today", date: new Date() },
    { label: "Tomorrow", date: addDays(new Date(), 1) },
    { label: "Next Week", date: addDays(new Date(), 7) },
    { label: "Next Month", date: addDays(new Date(), 30) },
  ];

  // Update time values when date changes
  React.useEffect(() => {
    if (date) {
      setHourValue(date.getHours());
      setMinuteValue(date.getMinutes());
    }
  }, [date]);

  // Apply selected time to the date
  const applyTimeToDate = () => {
    if (!date) return;

    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);

    onDateChange(newDate);
    setIsPopoverOpen(false);
  };

  // Handle quick date selection
  const handleQuickDateSelect = (newDate: Date) => {
    // Preserve time if date already exists
    if (date) {
      newDate.setHours(hours, minutes);
    }

    onDateChange(newDate);
  };

  // Handle calendar date selection
  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onDateChange(undefined);
      return;
    }

    // Preserve time if date already exists
    if (date) {
      newDate.setHours(hours, minutes);
    }

    onDateChange(newDate);

    // Switch to time tab if time selector is enabled
    if (showTimeSelector) {
      setActiveTab("time");
    } else {
      setIsPopoverOpen(false);
    }
  };

  // Handle manual date input
  const handleManualDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (!inputValue) {
      if (isOptional) {
        onDateChange(undefined);
      }
      return;
    }

    try {
      const newDate = new Date(inputValue);

      if (isValid(newDate)) {
        // Preserve time if previously selected
        if (date) {
          newDate.setHours(hours, minutes);
        }

        onDateChange(newDate);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  };

  // Clear the date
  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
    setIsPopoverOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            className={cn(
              "w-full justify-between bg-gray-900 border-gray-800 transition-all h-12 px-4",
              !date && "text-gray-500",
              error && "border-red-500 focus:ring-red-400",
              "hover:bg-gray-800/70"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={iconColor}>{icon}</span>
              {date ? (
                <span className="text-white truncate">
                  {format(date, showTimeSelector ? "PPP 'at' h:mm a" : "PPP")}
                </span>
              ) : (
                <span className="truncate">{placeholder}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isOptional && !date && (
                <Badge
                  variant="outline"
                  className="mr-1 text-xs font-normal bg-transparent border-gray-700"
                >
                  {optionalText}
                </Badge>
              )}

              {date && clearable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-red-900/20 hover:text-red-400"
                  onClick={handleClearDate}
                >
                  <span className="sr-only">Clear</span>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isPopoverOpen && "rotate-180"
                )}
              />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 bg-gray-900 border-gray-800 shadow-lg"
          align="start"
        >
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {showTimeSelector ? "Select Date & Time" : "Select Date"}
            </h3>
            <div className="flex items-center gap-2">
              {date && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={handleClearDate}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-gray-400 hover:text-gray-300"
                onClick={() => {
                  const now = new Date();
                  onDateChange(now);
                  setHourValue(now.getHours());
                  setMinuteValue(now.getMinutes());
                  setActiveTab("time");
                }}
              >
                Now
              </Button>
            </div>
          </div>

          {/* Quick date selection buttons */}
          <div className="p-2 border-b border-gray-800">
            <div className="flex flex-wrap gap-2">
              {quickDateOptions.map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-gray-800/50 border-gray-700 hover:bg-gray-700/70",
                    date &&
                      format(date, "yyyy-MM-dd") ===
                        format(option.date, "yyyy-MM-dd") &&
                      "bg-blue-900/30 border-blue-700 text-blue-400"
                  )}
                  onClick={() => handleQuickDateSelect(option.date)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={cn(
                "grid w-full rounded-none border-b border-gray-800 bg-gray-900",
                showTimeSelector ? "grid-cols-2" : "grid-cols-1"
              )}
            >
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>

              {showTimeSelector && (
                <TabsTrigger
                  value="time"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  disabled={!date}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Time
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="calendar" className="p-0 m-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleCalendarSelect}
                disabled={(date) => {
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                initialFocus
                className={cn("border-none rounded-none")}
              />

              <div className="p-3 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <Label htmlFor="manualDate" className="sr-only">
                    Manual date input
                  </Label>
                  <Input
                    id="manualDate"
                    type="date"
                    value={date ? format(date, "yyyy-MM-dd") : ""}
                    onChange={handleManualDateInput}
                    className="bg-gray-800 border-gray-700 focus:border-blue-600"
                  />

                  <Button
                    variant="secondary"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      if (showTimeSelector) {
                        setActiveTab("time");
                      } else {
                        setIsPopoverOpen(false);
                      }
                    }}
                  >
                    {showTimeSelector ? "Next" : "Select"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {showTimeSelector && (
              <TabsContent value="time" className="p-4 m-0 space-y-4">
                {date ? (
                  <div className="space-y-6">
                    {/* Hour selector */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-gray-300">
                          Hour
                        </Label>
                        <div className="text-xl font-semibold text-white bg-gray-800 py-1 px-3 rounded-md min-w-[60px] text-center">
                          {hours.toString().padStart(2, "0")}
                        </div>
                      </div>

                      <Slider
                        value={[hours]}
                        min={0}
                        max={23}
                        step={1}
                        onValueChange={(value) => setHourValue(value[0])}
                        className="py-2"
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>6</span>
                        <span>12</span>
                        <span>18</span>
                        <span>23</span>
                      </div>
                    </div>

                    {/* Minute selector */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-gray-300">
                          Minute
                        </Label>
                        <div className="text-xl font-semibold text-white bg-gray-800 py-1 px-3 rounded-md min-w-[60px] text-center">
                          {minutes.toString().padStart(2, "0")}
                        </div>
                      </div>

                      <Slider
                        value={[minutes]}
                        min={0}
                        max={59}
                        step={1}
                        onValueChange={(value) => setMinuteValue(value[0])}
                        className="py-2"
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>15</span>
                        <span>30</span>
                        <span>45</span>
                        <span>59</span>
                      </div>
                    </div>

                    {/* Common times */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">
                        Common Times
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { h: 9, m: 0, label: "9:00 AM" },
                          { h: 12, m: 0, label: "12:00 PM" },
                          { h: 15, m: 0, label: "3:00 PM" },
                          { h: 17, m: 30, label: "5:30 PM" },
                          { h: 0, m: 0, label: "12:00 AM" },
                          { h: 8, m: 30, label: "8:30 AM" },
                        ].map((time, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "bg-gray-800/50 border-gray-700",
                              hours === time.h &&
                                minutes === time.m &&
                                "bg-blue-900/30 border-blue-700 text-blue-400"
                            )}
                            onClick={() => {
                              setHourValue(time.h);
                              setMinuteValue(time.m);
                            }}
                          >
                            {time.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time display and Apply button */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                      <div className="text-3xl font-bold text-white">
                        {hours.toString().padStart(2, "0")}:
                        {minutes.toString().padStart(2, "0")}
                        <span className="text-sm text-gray-400 ml-2">
                          {hours >= 12 ? "PM" : "AM"}
                        </span>
                      </div>

                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={applyTimeToDate}
                      >
                        <Check className="h-4 w-4 mr-1" /> Apply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="h-12 w-12 text-gray-600 mb-3" />
                    <p className="text-gray-400">Please select a date first</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActiveTab("calendar")}
                    >
                      Select Date
                    </Button>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
