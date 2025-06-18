import { UserDto } from "@/services/adminService";
import { Table } from "@/components/ui/table";
import { UserTableHeader } from "./content/UserTableHeader";
import { UserTableBody } from "./content/UserTableBody";
import { UserTableEmpty } from "./UserTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";

interface UserTableContentProps {
  users: UserDto[] | undefined;
  selectedUsers: number[];
  onSelectAll: () => void;
  onSelectUser: (userId: number) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
  onRoleChange: (userId: number, roleName: string) => void;
  onEdit: (user: UserDto) => void;
  onEditEmail: (user: UserDto) => void;
  onViewLogs: (userId: number) => void;
  onDelete: (userId: number) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function UserTableContent({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onToggleStatus,
  onRoleChange,
  onEdit,
  onEditEmail,
  onViewLogs,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  isLoading = false,
  isError = false,
}: UserTableContentProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedUsers,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: users || [],
    initialPageSize: 15,
  });

  // Check if we have users to display
  const hasUsers = users && users.length > 0;

  // Handle select all for paginated data
  const handleSelectAll = () => {
    const currentPageUserIds = paginatedUsers.map((user) => user.id);
    const allCurrentSelected = currentPageUserIds.every((id) =>
      selectedUsers.includes(id)
    );

    if (allCurrentSelected) {
      // If all current page users are selected, deselect them
      const newSelected = selectedUsers.filter(
        (id) => !currentPageUserIds.includes(id)
      );
      onSelectAll(); // This should handle the logic in parent component
    } else {
      // If not all current page users are selected, select them all
      onSelectAll();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive font-bold">!</span>
              </div>
              <p className="text-destructive">
                Failed to load users. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        {hasUsers ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[1026px]">
                <Table className="table-fixed w-full">
                  <UserTableHeader
                    selectedCount={
                      selectedUsers.filter((id) =>
                        paginatedUsers.some((user) => user.id === id)
                      ).length
                    }
                    totalCount={paginatedUsers.length}
                    onSelectAll={handleSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <ScrollArea className="table-scroll-area h-full w-full">
                <div className="min-w-[1026px] pb-4">
                  <Table className="table-fixed w-full">
                    <UserTableBody
                      users={paginatedUsers}
                      selectedUsers={selectedUsers}
                      onSelectUser={onSelectUser}
                      onToggleStatus={onToggleStatus}
                      onRoleChange={onRoleChange}
                      onEdit={onEdit}
                      onEditEmail={onEditEmail}
                      onViewLogs={onViewLogs}
                      onDelete={onDelete}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <UserTableEmpty onClearFilters={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination */}
      {hasUsers && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
