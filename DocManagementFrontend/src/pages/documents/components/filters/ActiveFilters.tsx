
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"

interface ActiveFiltersProps {
  dateRange: any
  setDateRange: (range: any) => void
}

export function ActiveFilters({ dateRange, setDateRange }: ActiveFiltersProps) {
  if (!dateRange) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-500/30 flex gap-1">
        <CalendarDays className="h-3.5 w-3.5" />
        {dateRange.from ? (
          dateRange.to ? (
            <>
              {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
            </>
          ) : (
            format(dateRange.from, "MMM d, yyyy")
          )
        ) : (
          <span>Date Range</span>
        )}
        <button 
          onClick={() => setDateRange(undefined)}
          className="ml-1 hover:text-blue-200"
        >
          ×
        </button>
      </Badge>
    </div>
  )
}
