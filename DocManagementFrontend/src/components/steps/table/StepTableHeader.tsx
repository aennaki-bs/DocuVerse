import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoveRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  areAllEligibleSelected: boolean;
  hasEligibleSteps: boolean;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
}

export const StepTableHeader = ({
  onSelectAll,
  areAllEligibleSelected,
  hasEligibleSteps,
  onSort,
  sortField,
  sortDirection,
}: StepTableHeaderProps) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033] sticky top-0 z-10">
      <TableRow className="border-b border-blue-900/30 hover:bg-transparent">
        <TableHead className="w-10 px-4 py-3">
          <Checkbox
            checked={hasEligibleSteps ? areAllEligibleSelected : false}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            disabled={!hasEligibleSteps}
            className="border-blue-700/50"
          />
        </TableHead>
        <TableHead className="hidden md:table-cell px-4 py-3 text-sm font-medium text-blue-300/80 w-[15%]">
          Step Code
        </TableHead>
        <TableHead className="px-4 py-3 w-[30%]">
          <Button
            variant="ghost"
            className="p-0 font-semibold flex items-center text-left hover:bg-transparent hover:text-primary text-blue-200"
            onClick={() => onSort("title")}
          >
            Title {getSortIcon("title")}
          </Button>
        </TableHead>
        <TableHead className="px-4 py-3 w-[15%]">
          <Button
            variant="ghost"
            className="p-0 font-semibold flex items-center text-left hover:bg-transparent hover:text-primary text-blue-200"
            onClick={() => onSort("currentStatusId")}
          >
            Current Status {getSortIcon("currentStatusId")}
          </Button>
        </TableHead>
        <TableHead className="px-0 py-3 w-[5%] text-center">
          <MoveRight className="h-5 w-5 mx-auto text-blue-500/50" />
        </TableHead>
        <TableHead className="px-4 py-3 w-[15%]">
          <Button
            variant="ghost"
            className="p-0 font-semibold flex items-center text-left hover:bg-transparent hover:text-primary text-blue-200"
            onClick={() => onSort("nextStatusId")}
          >
            Next Status {getSortIcon("nextStatusId")}
          </Button>
        </TableHead>
        <TableHead className="px-4 py-3 w-[15%] text-blue-300/80">
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 mr-1.5" />
            Approval
          </div>
        </TableHead>
        <TableHead className="px-4 py-3 w-14 text-blue-300/80">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
