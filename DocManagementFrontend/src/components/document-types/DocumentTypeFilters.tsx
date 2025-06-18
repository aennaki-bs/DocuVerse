import { useState, useEffect } from "react";
import { X, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DocumentTypeFiltersProps {
  onFilterChange: (filters: any) => void;
  onClose: () => void;
  initialFilters?: any;
}

const DocumentTypeFilters = ({
  onFilterChange,
  onClose,
  initialFilters = {},
}: DocumentTypeFiltersProps) => {
  const [filterType, setFilterType] = useState<string>("typeName");
  const [filterValue, setFilterValue] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Initialize filters from initialFilters prop
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      const filtersArray = Object.entries(initialFilters).map(
        ([type, value]) => {
          let display = "";
          if (type === "createdAt" || type === "updatedAt") {
            const dateValue = value as DateRange;
            display = `${format(dateValue.from!, "MMM dd, yyyy")}${
              dateValue.to ? ` - ${format(dateValue.to, "MMM dd, yyyy")}` : ""
            }`;
          } else {
            display = value as string;
          }

          return {
            id: Date.now() + Math.random(),
            type,
            value,
            display,
          };
        }
      );

      setActiveFilters(filtersArray);
    }
  }, []);

  const handleApplyFilters = () => {
    // Add the current filter to active filters
    if (
      (filterType !== "createdAt" &&
        filterType !== "updatedAt" &&
        filterValue) ||
      ((filterType === "createdAt" || filterType === "updatedAt") &&
        dateRange?.from)
    ) {
      const newFilter = {
        id: Date.now(),
        type: filterType,
        value:
          filterType === "createdAt" || filterType === "updatedAt"
            ? dateRange
            : filterValue,
        display:
          filterType === "createdAt" || filterType === "updatedAt"
            ? `${format(dateRange?.from!, "MMM dd, yyyy")}${
                dateRange?.to
                  ? ` - ${format(dateRange.to, "MMM dd, yyyy")}`
                  : ""
              }`
            : filterValue,
      };

      const updatedFilters = [...activeFilters, newFilter];
      setActiveFilters(updatedFilters);

      // Reset the current filter inputs
      if (filterType === "createdAt" || filterType === "updatedAt") {
        setDateRange(undefined);
      } else {
        setFilterValue("");
      }

      // Send all filters to parent
      const filtersObj = updatedFilters.reduce((acc, filter) => {
        acc[filter.type] = filter.value;
        return acc;
      }, {});

      onFilterChange(filtersObj);
    }
  };

  const handleRemoveFilter = (id: number) => {
    const updatedFilters = activeFilters.filter((filter) => filter.id !== id);
    setActiveFilters(updatedFilters);

    // Send updated filters to parent
    const filtersObj = updatedFilters.reduce((acc, filter) => {
      acc[filter.type] = filter.value;
      return acc;
    }, {});

    onFilterChange(filtersObj);
  };

  const handleClearFilters = () => {
    setFilterType("typeName");
    setFilterValue("");
    setDateRange(undefined);
    setActiveFilters([]);
    onFilterChange({});
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case "typeName":
        return "Type Name";
      case "typeKey":
        return "Type Code";
      case "documentCounter":
        return "Document Count";
      case "createdAt":
        return "Created Date";
      case "updatedAt":
        return "Updated Date";
      case "attributes":
        return "Attributes";
      default:
        return type;
    }
  };

  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 rounded-md overflow-hidden">
      <div className="px-4 py-3 bg-blue-900/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-medium text-white">Advanced Filters</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-blue-800/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <label className="text-xs text-blue-300 mb-1 block">Filter by</label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typeName">Type Name</SelectItem>
              <SelectItem value="typeKey">Type Code</SelectItem>
              <SelectItem value="documentCounter">Document Count</SelectItem>
              <SelectItem value="attributes">Attributes</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          {filterType === "createdAt" || filterType === "updatedAt" ? (
            <div>
              <label className="text-xs text-blue-300 mb-1 block">
                Date Range
              </label>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>
          ) : filterType === "attributes" ? (
            <div>
              <label className="text-xs text-blue-300 mb-1 block">
                Attribute Status
              </label>
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                  <SelectValue placeholder="Select attribute status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="with">With Attributes</SelectItem>
                  <SelectItem value="without">Without Attributes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-blue-300 mb-1 block">Value</label>
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-400" />
                <Input
                  placeholder={`Enter ${getFilterLabel(
                    filterType
                  ).toLowerCase()}...`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="bg-blue-900/20 border-blue-800/30 text-white pl-8"
                />
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1 flex items-end">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleApplyFilters}
            disabled={
              (filterType !== "createdAt" &&
                filterType !== "updatedAt" &&
                filterType !== "attributes" &&
                !filterValue) ||
              ((filterType === "createdAt" || filterType === "updatedAt") &&
                !dateRange?.from) ||
              (filterType === "attributes" && !filterValue)
            }
          >
            Add Filter
          </Button>
        </div>
      </CardContent>

      {activeFilters.length > 0 && (
        <>
          <Separator className="bg-blue-900/30" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-medium text-blue-300">
                Active Filters
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-800/30 text-blue-100 border-blue-700/50 px-2 py-1"
                >
                  <span className="text-xs font-medium text-blue-400">
                    {getFilterLabel(filter.type)}:
                  </span>
                  <span className="text-xs">{filter.display}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="h-4 w-4 p-0 ml-1 text-blue-400 hover:text-blue-300 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default DocumentTypeFilters;
