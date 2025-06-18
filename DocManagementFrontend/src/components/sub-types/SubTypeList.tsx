import { useEffect } from "react";
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
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface SubTypeListProps {
  subTypes: SubType[];
  isLoading: boolean;
  onEdit: (subType: SubType) => void;
  onDelete: (subType: SubType) => void;
  isSimpleUser: boolean;
}

const SubTypeList = ({
  subTypes,
  isLoading,
  onEdit,
  onDelete,
  isSimpleUser,
}: SubTypeListProps) => {
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  if (isLoading) {
    return <div className="text-blue-300/70 text-sm">Loading series...</div>;
  }

  if (subTypes.length === 0) {
    return (
      <div className="text-blue-300/70 text-sm text-center py-8">
        No series found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Key</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subTypes.map((subType) => (
            <TableRow key={subType.id}>
              <TableCell className="font-mono text-sm text-blue-300">
                {subType.subTypeKey}
              </TableCell>
              <TableCell>{subType.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {subType.description}
              </TableCell>
              <TableCell>{formatDate(subType.startDate)}</TableCell>
              <TableCell>{formatDate(subType.endDate)}</TableCell>
              <TableCell>
                <Badge variant={subType.isActive ? "outline" : "secondary"}>
                  {subType.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!isSimpleUser && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(subType)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(subType)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubTypeList;
