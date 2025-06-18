import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDto } from "@/services/adminService";
import { Edit, Eye, Mail, MoreVertical, Trash, UserCog } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface UserActionsDropdownProps {
  user: UserDto;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
}

export function UserActionsDropdown({
  user,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
}: UserActionsDropdownProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 rounded-lg shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200 px-3 py-2">
          <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {t("userManagement.userActions")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

        <DropdownMenuItem
          onClick={() => onEdit(user)}
          className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
        >
          <Edit className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{t("userManagement.editUser")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onEditEmail(user)}
          className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
        >
          <Mail className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{t("userManagement.updateEmail")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onViewLogs(user.id)}
          className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
        >
          <Eye className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{t("userManagement.viewLogs")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

        <DropdownMenuItem
          className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-900 dark:hover:text-red-200 rounded-md focus:bg-red-100 dark:focus:bg-red-900/30 focus:text-red-900 dark:focus:text-red-200 px-3 py-2 cursor-pointer"
          onClick={() => onDelete(user.id)}
        >
          <Trash className="mr-2.5 h-4 w-4" />
          <span>{t("userManagement.deleteUser")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
