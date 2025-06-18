import { TableBody } from "@/components/ui/table";
import { UserDto } from "@/services/adminService";
import { UserTableRow } from "../UserTableRow";

interface UserTableBodyProps {
  users: UserDto[] | undefined;
  selectedUsers: number[];
  onSelectUser: (userId: number) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
  onRoleChange: (userId: number, roleName: string) => void;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
}

export function UserTableBody({
  users,
  selectedUsers,
  onSelectUser,
  onToggleStatus,
  onRoleChange,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
}: UserTableBodyProps) {
  return (
    <TableBody>
      {users?.map((user) => (
        <UserTableRow
          key={user.id}
          user={user}
          isSelected={selectedUsers.includes(user.id)}
          onSelect={onSelectUser}
          onToggleStatus={onToggleStatus}
          onRoleChange={onRoleChange}
          onEdit={onEdit}
          onEditEmail={onEditEmail}
          onViewLogs={onViewLogs}
          onDelete={onDelete}
        />
      ))}
    </TableBody>
  );
}
