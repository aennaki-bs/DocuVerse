
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchField: string
  setSearchField: (field: string) => void
  dateRange: any
  setDateRange: (range: any) => void
  isDatePickerEnabled: boolean
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  searchField,
  setSearchField,
  dateRange,
  setDateRange,
  isDatePickerEnabled
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/70" />
        <Input 
          placeholder="Search documents..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-blue-900/20 border-blue-800/30 text-white placeholder:text-blue-300/50 w-full focus:border-blue-500"
        />
      </div>
      
      <Select value={searchField} onValueChange={setSearchField}>
        <SelectTrigger className="w-[140px] ml-2 bg-blue-900/20 border-blue-800/30 text-white">
          <SelectValue placeholder="All fields" />
        </SelectTrigger>
        <SelectContent className="bg-[#0a1033] border-blue-900/30">
          <SelectItem value="all">All fields</SelectItem>
          <SelectItem value="documentKey">Document Code</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="documentType">Type</SelectItem>
          <SelectItem value="docDate">Document Date</SelectItem>
          <SelectItem value="createdBy">Created By</SelectItem>
        </SelectContent>
      </Select>

      <DateRangePicker
        date={dateRange}
        onDateChange={setDateRange}
        className="w-auto"
        align="end"
        disabled={!isDatePickerEnabled}
      />
    </div>
  )
}
