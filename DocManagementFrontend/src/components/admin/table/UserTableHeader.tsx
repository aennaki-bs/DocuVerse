import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_USER_SEARCH_FIELDS } from "@/components/table/constants/filters";

export function UserTableHeader({
  searchQuery,
  setSearchQuery,
  searchField,
  setSearchField,
  onOpenFilters,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchField: string;
  setSearchField: (field: string) => void;
  onOpenFilters: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
      <div className="flex-1 flex items-center space-x-2">
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-36 bg-[#0d1424] border-gray-700 text-white">
            <SelectValue placeholder="Search by..." />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1424] border-gray-700 text-white">
            <SelectItem value="fullName">Full Name</SelectItem>
            {DEFAULT_USER_SEARCH_FIELDS.filter((f) => f.id !== "all").map(
              (field) => (
                <SelectItem key={field.id} value={field.id as string}>
                  {field.label}
                </SelectItem>
              )
            )}
            <SelectItem value="all">All fields</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative w-full">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0d1424] border-gray-700 text-white pl-10"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
