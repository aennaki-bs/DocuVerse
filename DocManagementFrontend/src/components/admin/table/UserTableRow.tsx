import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserDto } from "@/services/adminService";
import { UserActionsDropdown } from "./row/UserActionsDropdown";
import { UserRoleSelect } from "./row/UserRoleSelect";
import { BlockUserDialog } from "./row/BlockUserDialog";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/useTranslation";

interface UserTableRowProps {
  user: UserDto;
  isSelected: boolean;
  onSelect: (userId: number) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
  onRoleChange: (userId: number, roleName: string) => void;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
}

function getRoleString(
  role: string | { roleId?: number; roleName?: string }
): string {
  if (typeof role === "string") {
    return role;
  }

  if (role && typeof role === "object" && "roleName" in role) {
    return role.roleName || "Unknown";
  }

  return "Unknown";
}

export function UserTableRow({
  user,
  isSelected,
  onSelect,
  onToggleStatus,
  onRoleChange,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
}: UserTableRowProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const currentRole = getRoleString(user.role);
  const { t } = useTranslation();

  const handleStatusToggle = () => {
    setShowBlockDialog(true);
  };

  const confirmStatusToggle = () => {
    onToggleStatus(user.id, user.isActive);
    setShowBlockDialog(false);
  };

  const handleEdit = () => {
    console.log("Handling edit for user:", user);
    onEdit(user);
  };

  return (
    <>
      <TableRow
        className={`border-blue-200 dark:border-blue-900/30 transition-all duration-150 ${
          isSelected
            ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-500"
            : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
        }`}
      >
        <TableCell className="w-[48px]">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(user.id)}
              aria-label={`Select user ${user.username}`}
              className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
            />
          </div>
        </TableCell>
        <TableCell className="w-[48px]">
          <Avatar className="border-2 border-blue-300 dark:border-blue-900/50 h-9 w-9">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell className="w-[200px]">
          <div className="font-medium text-blue-900 dark:text-blue-100">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            @{user.username}
          </div>
        </TableCell>
        <TableCell className="w-[280px] text-blue-800 dark:text-blue-200">
          <span className="block truncate">{user.email}</span>
        </TableCell>

        <TableCell className="w-[150px]">
          <UserRoleSelect
            currentRole={currentRole}
            onRoleChange={(role) => onRoleChange(user.id, role)}
          />
        </TableCell>

        <TableCell className="w-[120px]">
          {user.isActive ? (
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {t("userManagement.active")}
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-900/30"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              {t("userManagement.inactive")}
            </Badge>
          )}
        </TableCell>

        <TableCell className="w-[100px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Switch
                    checked={user.isActive}
                    onCheckedChange={handleStatusToggle}
                    className={
                      user.isActive
                        ? "bg-emerald-600 data-[state=checked]:bg-emerald-600"
                        : "bg-red-600 data-[state=unchecked]:bg-red-600"
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white dark:bg-blue-900/90 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-500/30"
              >
                {user.isActive ? t("userManagement.blockUser") : t("userManagement.unblockUser")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        <TableCell className="w-[80px] text-right">
          <UserActionsDropdown
            user={user}
            onEdit={handleEdit}
            onEditEmail={onEditEmail}
            onViewLogs={onViewLogs}
            onDelete={onDelete}
          />
        </TableCell>
      </TableRow>

      <BlockUserDialog
        isOpen={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        onConfirm={confirmStatusToggle}
        userName={`${user.firstName} ${user.lastName}`}
        isBlocked={user.isActive}
      />
    </>
  );
}
