import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreVertical, Trash, Users } from "lucide-react";

interface ApprovalActionsDropdownProps {
  item: any;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  isEditDisabled?: boolean;
  isDeleteDisabled?: boolean;
  disabledTooltip?: string;
}

export function ApprovalActionsDropdown({
  item,
  onView,
  onEdit,
  onDelete,
  isEditDisabled = false,
  isDeleteDisabled = false,
  disabledTooltip = "",
}: ApprovalActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-blue-900/30 text-blue-300 hover:text-blue-200"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-blue-100 rounded-lg shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-blue-200 px-3 py-2">
          <Users className="h-4 w-4 text-blue-400" />
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-800/40 my-1" />

        {onView && (
          <DropdownMenuItem
            onClick={() => onView(item)}
            className="hover:bg-blue-800/40 rounded-md focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
          >
            <Eye className="mr-2.5 h-4 w-4 text-blue-400" />
            <span>View Details</span>
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem
            onClick={() => !isEditDisabled && onEdit(item)}
            className={`rounded-md px-3 py-2 ${
              isEditDisabled
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-blue-800/40 focus:bg-blue-800/40 cursor-pointer"
            }`}
            title={isEditDisabled ? disabledTooltip : ""}
          >
            <Edit className="mr-2.5 h-4 w-4 text-blue-400" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator className="bg-blue-800/40 my-1" />
            <DropdownMenuItem
              className={`rounded-md px-3 py-2 ${
                isDeleteDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "text-red-300 hover:bg-red-900/30 hover:text-red-200 focus:bg-red-900/30 focus:text-red-200 cursor-pointer"
              }`}
              onClick={() => !isDeleteDisabled && onDelete(item)}
              title={isDeleteDisabled ? disabledTooltip : ""}
            >
              <Trash className="mr-2.5 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
