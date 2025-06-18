import { SubType } from "@/models/subtype";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, AlertCircle, Loader2, Info } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubTypesTableProps {
  subTypes: SubType[];
  isLoading: boolean;
  onEdit: (subType: SubType) => void;
  onDelete: (subType: SubType) => void;
}

export function SubTypesTable({
  subTypes,
  isLoading,
  onEdit,
  onDelete,
}: SubTypesTableProps) {
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-blue-300/70">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-400" />
        <div className="text-sm">Loading series...</div>
      </div>
    );
  }

  if (subTypes.length === 0) {
    return (
      <div className="bg-[#0a1033]/60 border border-blue-900/30 rounded-lg p-8 text-center">
        <AlertCircle className="h-10 w-10 text-blue-400/70 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-blue-300 mb-1">
          No series found
        </h3>
        <p className="text-blue-300/70 text-sm max-w-md mx-auto">
          No series match your current filters. Try adjusting your search
          criteria or create a new series.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-blue-900/30 rounded-lg overflow-hidden shadow-lg">
      <Table>
        <TableHeader className="bg-[#0a1033]">
          <TableRow className="hover:bg-[#0a1033]/80 border-blue-900/30">
            <TableHead className="text-blue-300 font-medium">Code</TableHead>
            <TableHead className="text-blue-300 font-medium">
              Start Date
            </TableHead>
            <TableHead className="text-blue-300 font-medium">
              End Date
            </TableHead>
            <TableHead className="text-blue-300 font-medium">Status</TableHead>
            <TableHead className="text-right text-blue-300 font-medium">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subTypes.map((subType) => (
            <TableRow
              key={subType.id}
              className="hover:bg-blue-900/10 border-blue-900/30"
            >
              <TableCell className="font-medium">
                {subType.subTypeKey}
              </TableCell>
              <TableCell>{formatDate(subType.startDate)}</TableCell>
              <TableCell>{formatDate(subType.endDate)}</TableCell>
              <TableCell>
                <Badge
                  variant={subType.isActive ? "success" : "secondary"}
                  className={
                    subType.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                >
                  {subType.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                    onClick={() => onEdit(subType)}
                    title="Edit series"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={() => onDelete(subType)}
                    title="Delete series"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-2 text-xs text-gray-500 bg-[#0a1033]/70 border-t border-blue-900/30">
        Showing {subTypes.length}{" "}
        {subTypes.length === 1 ? "series" : "series"}
      </div>
    </div>
  );
}
