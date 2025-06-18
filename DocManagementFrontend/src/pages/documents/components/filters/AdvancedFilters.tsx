
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { X } from "lucide-react"
import { STATUS_FILTERS, TYPE_FILTERS } from "../../types/filters"

interface AdvancedFiltersProps {
  statusFilter: string
  setStatusFilter: (status: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  dateRange: any
  setDateRange: (range: any) => void
  onClose: () => void
  onApply: () => void
  onClear: () => void
}

export function AdvancedFilters({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  dateRange,
  setDateRange,
  onClose,
  onApply,
  onClear
}: AdvancedFiltersProps) {
  return (
    <div className="bg-[#0a1033] border border-blue-900/30 rounded-md p-4 mt-2 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-white">Advanced Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="h-7 w-7 p-0 text-blue-300 hover:text-blue-200 hover:bg-blue-900/30"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-blue-300 mb-1 block">Document Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1033] border-blue-900/30">
              {STATUS_FILTERS.map(filter => (
                <SelectItem key={filter.id} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs text-blue-300 mb-1 block">Document Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1033] border-blue-900/30">
              {TYPE_FILTERS.map(filter => (
                <SelectItem key={filter.id} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs text-blue-300 mb-1 block">Date Range</label>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClear}
          className="border-blue-800/50 text-blue-300 hover:bg-blue-900/30"
        >
          Clear
        </Button>
        <Button 
          size="sm"
          onClick={onApply}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
