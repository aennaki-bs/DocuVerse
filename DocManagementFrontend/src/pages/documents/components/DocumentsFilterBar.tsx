import { useState, useEffect, useMemo } from "react";
import { useDocumentsFilter } from "../hooks/useDocumentsFilter";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Search,
  X,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  CalendarRange,
  Check,
  Tag,
  FileText,
  Clock,
  RefreshCw,
  User,
} from "lucide-react";
import {
  DEFAULT_STATUS_FILTERS,
  DEFAULT_TYPE_FILTERS,
  DEFAULT_DOCUMENT_SEARCH_FIELDS,
} from "@/components/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  format,
  isToday,
  isYesterday,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import documentTypeService from "@/services/documentTypeService";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/useTranslation";

const DATE_PRESETS = [
  {
    label: "Today",
    value: "today",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Yesterday",
    value: "yesterday",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "This Week",
    value: "thisWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Last Week",
    value: "lastWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "This Month",
    value: "thisMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Last Month",
    value: "lastMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Custom Range",
    value: "custom",
    icon: <Calendar className="h-3.5 w-3.5 mr-1.5" />,
  },
];

export default function DocumentsFilterBar() {
  const { t } = useTranslation();
  const {
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    activeFilters,
    applyFilters,
    resetFilters,
    isFilterActive,
    activeFilterCount,
  } = useDocumentsFilter();

  const [searchField, setSearchField] = useState(
    activeFilters.searchField || "all"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<string>("custom");

  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState(
    activeFilters.statusFilter || "any"
  );
  const [typeFilter, setTypeFilter] = useState(
    activeFilters.typeFilter || "any"
  );
  const [advancedDateRange, setAdvancedDateRange] = useState<
    DateRange | undefined
  >(dateRange);

  // Fetch document types for the filter
  const { data: documentTypes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => documentTypeService.getAllDocumentTypes(),
  });

  // Generate document type filter options
  const typeFilterOptions = useMemo(() => {
    const baseOptions = [...DEFAULT_TYPE_FILTERS];

    if (documentTypes && documentTypes.length > 0) {
      documentTypes.forEach((type) => {
        baseOptions.push({
          id: type.id || 0,
          label: type.typeName,
          value: String(type.id),
        });
      });
    }

    return baseOptions;
  }, [documentTypes]);

  // Update local state when activeFilters change
  useEffect(() => {
    setSearchField(activeFilters.searchField || "all");
    setStatusFilter(activeFilters.statusFilter || "any");
    setTypeFilter(activeFilters.typeFilter || "any");
    setAdvancedDateRange(activeFilters.dateRange);

    // Determine if a date preset is active
    if (activeFilters.dateRange) {
      const preset = getDatePresetFromRange(activeFilters.dateRange);
      setSelectedDatePreset(preset || "custom");
    } else {
      setSelectedDatePreset("custom");
    }
  }, [activeFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters({
      ...activeFilters,
      searchQuery: query,
      searchField,
    });
  };

  const handleSearchFieldChange = (field: string) => {
    setSearchField(field);
    applyFilters({
      ...activeFilters,
      searchField: field,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters({
      ...activeFilters,
      statusFilter: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters({
      ...activeFilters,
      typeFilter: value,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAdvancedDateRange(range);
    setDateRange(range);
    applyFilters({
      ...activeFilters,
      dateRange: range,
    });
  };

  const applyAdvancedFilters = () => {
    applyFilters({
      ...activeFilters,
      statusFilter,
      typeFilter,
      dateRange: advancedDateRange,
    });
    setFilterOpen(false);
  };

  const clearAllFilters = () => {
    setStatusFilter("any");
    setTypeFilter("any");
    setAdvancedDateRange(undefined);
    setSelectedDatePreset("custom");
    resetFilters();
    setFilterOpen(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search documents..."]'
        ) as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Escape to close filter popover
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }

      // Alt + F to open filter
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }

      // Alt + C to clear all filters
      if (e.altKey && e.key === "c" && isFilterActive) {
        e.preventDefault();
        clearAllFilters();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen, isFilterActive, clearAllFilters]);

  // Apply date preset
  const applyDatePreset = (preset: string) => {
    setSelectedDatePreset(preset);

    let newRange: DateRange | undefined;
    const today = new Date();

    switch (preset) {
      case "today":
        newRange = { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      case "thisWeek":
        newRange = {
          from: startOfWeek(today, { weekStartsOn: 0 }),
          to: endOfWeek(today, { weekStartsOn: 0 }),
        };
        break;
      case "lastWeek":
        const lastWeekStart = subDays(
          startOfWeek(today, { weekStartsOn: 0 }),
          7
        );
        newRange = {
          from: lastWeekStart,
          to: addDays(lastWeekStart, 6),
        };
        break;
      case "thisMonth":
        newRange = {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        newRange = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
        break;
      case "custom":
        // Keep the current advanced date range
        newRange = advancedDateRange;
        break;
      default:
        newRange = undefined;
    }

    setAdvancedDateRange(newRange);
    handleDateRangeChange(newRange);
  };

  // Get date preset from range
  const getDatePresetFromRange = (range: DateRange): string | null => {
    if (!range.from || !range.to) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = new Date(range.from);
    const to = new Date(range.to);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    if (
      from.getTime() === today.getTime() &&
      to.getTime() === today.getTime()
    ) {
      return "today";
    }

    const yesterday = subDays(today, 1);
    if (
      from.getTime() === yesterday.getTime() &&
      to.getTime() === yesterday.getTime()
    ) {
      return "yesterday";
    }

    const thisWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
    if (
      from.getTime() === thisWeekStart.getTime() &&
      to.getTime() === thisWeekEnd.getTime()
    ) {
      return "thisWeek";
    }

    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekEnd, 7);
    if (
      from.getTime() === lastWeekStart.getTime() &&
      to.getTime() === lastWeekEnd.getTime()
    ) {
      return "lastWeek";
    }

    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    if (
      from.getTime() === thisMonthStart.getTime() &&
      to.getTime() === thisMonthEnd.getTime()
    ) {
      return "thisMonth";
    }

    const lastMonth = subDays(thisMonthStart, 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);
    if (
      from.getTime() === lastMonthStart.getTime() &&
      to.getTime() === lastMonthEnd.getTime()
    ) {
      return "lastMonth";
    }

    return null;
  };

  // Format date range for display
  const formatDateRangeDisplay = (range: DateRange | undefined): string => {
    if (!range || !range.from) return "Any date";

    const from = new Date(range.from);

    if (!range.to) {
      return `From ${format(from, "MMM d, yyyy")}`;
    }

    const to = new Date(range.to);

    if (from.getTime() === to.getTime()) {
      if (isToday(from)) return "Today";
      if (isYesterday(from)) return "Yesterday";
      return format(from, "MMM d, yyyy");
    }

    return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Search bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0 bg-[#1e2a4a] rounded-lg p-1 border border-blue-900/40 shadow-inner">
          <div className="relative flex-1">
            <Input
              placeholder={t("documents.searchDocuments")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
              aria-label="Search documents"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
              <Search className="h-4 w-4 text-blue-400" />
              {/* <kbd className="sr-only md:not-sr-only md:ml-2 text-[10px] text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-800/50 hidden md:inline-block">
                Ctrl+F
              </kbd> */}
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  applyFilters({
                    ...activeFilters,
                    searchQuery: "",
                  });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter dropdown button */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-md rounded-md flex items-center gap-2 h-10 px-4 min-w-[120px] transition-all duration-200",
                isFilterActive && "border-blue-500 bg-blue-900/40"
              )}
              aria-label="Toggle filter panel"
            >
              <SlidersHorizontal
                className={cn(
                  "h-4 w-4",
                  isFilterActive ? "text-blue-300" : "text-blue-400"
                )}
              />
              <span className="flex-1 text-left">Filter</span>
              {isFilterActive ? (
                <Badge className="bg-blue-600 text-white text-xs py-0 px-1.5 rounded-full">
                  {activeFilterCount}
                </Badge>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                  <kbd className="sr-only md:not-sr-only text-[10px] text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-800/50 hidden md:inline-block ml-1">
                    Alt+F
                  </kbd>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[340px] sm:w-[400px] bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-xl p-0 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
            align="end"
            sideOffset={5}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 border-b border-blue-900/30 bg-gradient-to-r from-[#1a2c6b]/50 to-[#0a1033]/50"
            >
              <h3 className="text-lg font-medium text-blue-100 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-400" />
                Filter Documents
              </h3>
              <p className="text-sm text-blue-300/80 mt-1">
                Refine your document list using the filters below
              </p>
            </motion.div>

            <Tabs
              defaultValue="filters"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full bg-blue-900/20 border-b border-blue-900/30 rounded-none">
                <TabsTrigger
                  value="filters"
                  className="flex-1 data-[state=active]:bg-blue-800/30"
                >
                  <Tag className="h-4 w-4 mr-2" /> Filters
                </TabsTrigger>
                <TabsTrigger
                  value="date"
                  className="flex-1 data-[state=active]:bg-blue-800/30"
                >
                  <CalendarRange className="h-4 w-4 mr-2" /> Date Range
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[350px] overflow-auto">
                <TabsContent value="filters" className="p-4 space-y-4 mt-0">
                  {/* Search field filter */}
                  <div>
                    <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                      <Search className="h-4 w-4 mr-2 text-blue-400" />
                      Search In
                    </label>
                    <Select
                      value={searchField}
                      onValueChange={handleSearchFieldChange}
                    >
                      <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                        <SelectValue>
                          {DEFAULT_DOCUMENT_SEARCH_FIELDS.find(
                            (opt) => opt.id === searchField
                          )?.label || "All fields"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                        {DEFAULT_DOCUMENT_SEARCH_FIELDS.map((opt) => (
                          <SelectItem
                            key={opt.id}
                            value={String(opt.id)}
                            className="hover:bg-blue-800/40"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-400" />
                      Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_STATUS_FILTERS.map((status) => (
                        <Button
                          key={status.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 h-9",
                            statusFilter === status.value &&
                              "bg-blue-800 border-blue-500"
                          )}
                          onClick={() => handleStatusChange(status.value)}
                        >
                          {statusFilter === status.value && (
                            <Check className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                          )}
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Document Type filter */}
                  <div>
                    <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-400" />
                      Document Type
                    </label>
                    <Select value={typeFilter} onValueChange={handleTypeChange}>
                      <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                        <SelectValue>
                          {typeFilterOptions.find(
                            (opt) => opt.value === typeFilter
                          )?.label || "Any Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40 max-h-[200px]">
                        {typeFilterOptions.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="hover:bg-blue-800/40"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="date" className="p-4 space-y-4 mt-0">
                  {/* Date range presets */}
                  <div>
                    <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-400" />
                      Quick Date Ranges
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {DATE_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 h-9 justify-start",
                            selectedDatePreset === preset.value &&
                              "bg-blue-800 border-blue-500"
                          )}
                          onClick={() => applyDatePreset(preset.value)}
                        >
                          {preset.icon}
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Calendar date picker */}
                  {selectedDatePreset === "custom" && (
                    <div className="border border-blue-900/40 rounded-md p-3 bg-blue-900/20">
                      <label className="text-sm font-medium text-blue-200 block mb-2">
                        Select Custom Date Range
                      </label>
                      <div className="flex justify-center">
                        <CalendarComponent
                          mode="range"
                          selected={advancedDateRange}
                          onSelect={handleDateRangeChange}
                          className="bg-[#22306e] border border-blue-900/40 rounded-md shadow-md"
                          classNames={{
                            day_selected: "bg-blue-600 text-white",
                            day_today: "bg-blue-900/40 text-blue-200",
                          }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-blue-300">
                        {advancedDateRange?.from ? (
                          advancedDateRange.to ? (
                            <>
                              <span>
                                {format(advancedDateRange.from, "PPP")} -{" "}
                                {format(advancedDateRange.to, "PPP")}
                              </span>
                            </>
                          ) : (
                            <span>{format(advancedDateRange.from, "PPP")}</span>
                          )
                        ) : (
                          <span>Select a date range</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="bg-blue-900/20 p-2 rounded-md border border-blue-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-300 font-medium">
                          Active Date Filter:
                        </span>
                        <span className="text-sm text-white">
                          {dateRange
                            ? formatDateRangeDisplay(dateRange)
                            : "Any date"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="p-3 border-t border-blue-900/30 bg-blue-900/20 flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-blue-300 hover:text-blue-200 hover:bg-blue-800/40"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Reset All
                <kbd className="sr-only md:not-sr-only text-[10px] text-blue-400/70 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-800/30 ml-1.5 hidden md:inline-block">
                  Alt+C
                </kbd>
              </Button>
              <Button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      <AnimatePresence>
        {isFilterActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {activeFilters.searchQuery && (
              <Badge
                variant="outline"
                className="bg-blue-900/30 text-blue-100 border-blue-800/50 flex items-center gap-1 h-6 px-2 py-0"
              >
                <Search className="h-3 w-3 text-blue-400" />
                <span className="text-xs">{activeFilters.searchQuery}</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    applyFilters({
                      ...activeFilters,
                      searchQuery: "",
                    });
                  }}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {activeFilters.statusFilter &&
              activeFilters.statusFilter !== "any" && (
                <Badge
                  variant="outline"
                  className="bg-blue-900/30 text-blue-100 border-blue-800/50 flex items-center gap-1 h-6 px-2 py-0"
                >
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span className="text-xs">
                    {DEFAULT_STATUS_FILTERS.find(
                      (s) => s.value === activeFilters.statusFilter
                    )?.label || "Status"}
                  </span>
                  <button
                    onClick={() => {
                      setStatusFilter("any");
                      applyFilters({
                        ...activeFilters,
                        statusFilter: "any",
                      });
                    }}
                    className="ml-1 text-blue-400 hover:text-blue-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

            {activeFilters.typeFilter && activeFilters.typeFilter !== "any" && (
              <Badge
                variant="outline"
                className="bg-blue-900/30 text-blue-100 border-blue-800/50 flex items-center gap-1 h-6 px-2 py-0"
              >
                <FileText className="h-3 w-3 text-blue-400" />
                <span className="text-xs">
                  {typeFilterOptions.find(
                    (t) => t.value === activeFilters.typeFilter
                  )?.label || "Type"}
                </span>
                <button
                  onClick={() => {
                    setTypeFilter("any");
                    applyFilters({
                      ...activeFilters,
                      typeFilter: "any",
                    });
                  }}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {activeFilters.dateRange && (
              <Badge
                variant="outline"
                className="bg-blue-900/30 text-blue-100 border-blue-800/50 flex items-center gap-1 h-6 px-2 py-0"
              >
                <Calendar className="h-3 w-3 text-blue-400" />
                <span className="text-xs">
                  {formatDateRangeDisplay(activeFilters.dateRange)}
                </span>
                <button
                  onClick={() => {
                    setDateRange(undefined);
                    setAdvancedDateRange(undefined);
                    setSelectedDatePreset("custom");
                    applyFilters({
                      ...activeFilters,
                      dateRange: undefined,
                    });
                  }}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 py-0 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
