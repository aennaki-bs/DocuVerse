import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Calendar,
  X,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { motion } from "framer-motion";

interface SubTypeFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeOnly: boolean;
  setActiveOnly: (active: boolean) => void;
  startDateFilter: Date | null;
  setStartDateFilter: (date: Date | null) => void;
  endDateFilter: Date | null;
  setEndDateFilter: (date: Date | null) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export function SubTypeFilterBar({
  searchQuery,
  setSearchQuery,
  activeOnly,
  setActiveOnly,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  applyFilters,
  resetFilters,
}: SubTypeFilterBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [hasFilters, setHasFilters] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    // Check if any filters are active
    const filtersActive = !!startDateFilter || !!endDateFilter;
    setHasFilters(filtersActive);
    setShowClearButton(filtersActive || !!searchQuery);
  }, [startDateFilter, endDateFilter, searchQuery]);

  // Update parent search query when local query changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300); // 300ms delay for better performance

    return () => clearTimeout(debounceTimer);
  }, [localSearchQuery, setSearchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setSearchQuery("");
  };

  const handleApplyFilters = () => {
    applyFilters();
    setFilterOpen(false); // Close the filter panel when Apply is clicked
  };

  return (
    <div className="bg-gradient-to-r from-[#0a1033]/70 to-[#0c1338]/70 border border-blue-900/40 rounded-lg p-4 mb-4 shadow-md">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="relative group">
            <Input
              placeholder="Search series by code..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pr-20 bg-[#0a1033]/80 border-blue-900/40 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 text-white pl-10 h-10 rounded-lg shadow-inner transition-all duration-200"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/70">
              <Search className="h-4 w-4" />
            </div>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex">
              {localSearchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-gray-500 hover:text-gray-300 transition-colors mr-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-600/90 hover:bg-blue-500 text-white rounded-md p-1 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Date Filters popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`flex gap-2 items-center px-3 h-10 ${
                hasFilters
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : "bg-[#0d1541]/70 border-blue-900/50"
              } transition-all duration-200 hover:bg-blue-800/30 rounded-lg`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Date Filters</span>
              {hasFilters && (
                <span className="flex items-center justify-center bg-blue-600 text-white w-5 h-5 rounded-full text-xs font-medium">
                  {(!!startDateFilter ? 1 : 0) + (!!endDateFilter ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-4 bg-[#0d1541] border-blue-900/50 text-white rounded-lg shadow-lg"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-300 flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Filters
                </h4>
                <div className="h-px bg-blue-900/40" />
              </div>

              {/* Date Filters */}
              <div className="space-y-3">
                <h5 className="text-sm text-blue-300 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Date Range
                </h5>

                {/* Start Date Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="start-date-filter" className="text-xs">
                    After
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date-filter"
                        variant="outline"
                        className={`justify-start text-left font-normal ${
                          startDateFilter ? "text-white" : "text-gray-400"
                        } h-8 bg-[#0a1033] border-blue-900/50 hover:bg-[#0a1033]/80 hover:border-blue-900/60 transition-colors rounded-md`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDateFilter ? (
                          format(startDateFilter, "PP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        {startDateFilter && (
                          <X
                            className="ml-auto h-4 w-4 opacity-70 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStartDateFilter(null);
                            }}
                          />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-[#0a1033] border-blue-900/50 rounded-lg shadow-xl"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={startDateFilter || undefined}
                        onSelect={(date) => setStartDateFilter(date)}
                        initialFocus
                        className="rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="end-date-filter" className="text-xs">
                    Before
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date-filter"
                        variant="outline"
                        className={`justify-start text-left font-normal ${
                          endDateFilter ? "text-white" : "text-gray-400"
                        } h-8 bg-[#0a1033] border-blue-900/50 hover:bg-[#0a1033]/80 hover:border-blue-900/60 transition-colors rounded-md`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDateFilter ? (
                          format(endDateFilter, "PP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        {endDateFilter && (
                          <X
                            className="ml-auto h-4 w-4 opacity-70 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEndDateFilter(null);
                            }}
                          />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-[#0a1033] border-blue-900/50 rounded-lg shadow-xl"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={endDateFilter || undefined}
                        onSelect={(date) => setEndDateFilter(date)}
                        initialFocus
                        className="rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-900/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDateFilter(null);
                    setEndDateFilter(null);
                  }}
                  className="text-xs h-8 bg-transparent border-blue-900/50 hover:bg-blue-900/20"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear Dates
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyFilters}
                  className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active/All filter buttons */}
        <div className="flex items-center">
          <Button
            variant={activeOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveOnly(true)}
            className={`h-10 rounded-r-none border-r-0 ${
              activeOnly
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-[#0d1541]/70 border-blue-900/50 text-gray-400 hover:text-white"
            } transition-all duration-200`}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Active
          </Button>
          <Button
            variant={!activeOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveOnly(false)}
            className={`h-10 rounded-l-none ${
              !activeOnly
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : "bg-[#0d1541]/70 border-blue-900/50 text-gray-400 hover:text-white"
            } transition-all duration-200`}
          >
            <span className="mr-1">All</span>
          </Button>
        </div>

        {/* Clear All button (shown only when filters are active) */}
        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-10 text-gray-400 hover:text-white bg-transparent hover:bg-red-900/10 border border-transparent hover:border-red-900/30"
          >
            <X className="mr-1 h-4 w-4 text-red-400" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
