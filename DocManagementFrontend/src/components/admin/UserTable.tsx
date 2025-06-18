import { useState } from "react";
import { toast } from "sonner";
import adminService from "@/services/adminService";
import { UserTableHeader } from "./table/UserTableHeader";
import { UserTableContent } from "./table/UserTableContent";
import { BulkActionsBar } from "./table/BulkActionsBar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DirectEditUserModal } from "./DirectEditUserModal";
import { DirectEditUserEmailModal } from "./DirectEditUserEmailModal";
import { ViewUserLogsDialog } from "./ViewUserLogsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement } from "./hooks/useUserManagement";
import { AlertTriangle, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_USER_SEARCH_FIELDS } from "@/components/table/constants/filters";
import { BulkRoleChangeDialog } from "./dialogs/BulkRoleChangeDialog";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";
import { useTranslation } from "@/hooks/useTranslation";

export function UserTable() {
  const [directEditModalOpen, setDirectEditModalOpen] = useState(false);
  const [directEditEmailModalOpen, setDirectEditEmailModalOpen] =
    useState(false);
  const { t, tWithParams } = useTranslation();

  const {
    selectedUsers,
    editingUser,
    editEmailUser,
    viewingUserLogs,
    deletingUser,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    roleChangeOpen,
    selectedRole,
    users: filteredUsers,
    isLoading,
    isError,
    refetch,
    setEditingUser,
    setEditEmailUser,
    setViewingUserLogs,
    setDeletingUser,
    setDeleteMultipleOpen,
    setRoleChangeOpen,
    setSelectedRole,
    handleSort,
    sortBy,
    sortDirection,
    handleSelectUser,
    handleSelectAll,
    handleUserEdited,
    handleUserEmailEdited,
    handleMultipleDeleted,
  } = useUserManagement();

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      await adminService.updateUser(userId, { isActive: newStatus });
      toast.success(
        newStatus
          ? t("userManagement.userActivated")
          : t("userManagement.userBlocked")
      );
      refetch();
    } catch (error) {
      toast.error(
        currentStatus
          ? t("userManagement.failedToBlock")
          : t("userManagement.failedToActivate")
      );
      console.error(error);
    }
  };

  const handleUserRoleChange = async (userId: number, roleName: string) => {
    try {
      await adminService.updateUser(userId, { roleName });
      toast.success(
        tWithParams("userManagement.roleChanged", { role: roleName })
      );
      refetch();
    } catch (error) {
      toast.error(t("userManagement.failedToChangeRole"));
      console.error(error);
    }
  };

  const handleBulkRoleChange = async () => {
    if (!selectedRole || selectedUsers.length === 0) {
      toast.error("Please select a role and at least one user");
      return;
    }

    try {
      const updatePromises = selectedUsers.map((userId) =>
        adminService.updateUser(userId, { roleName: selectedRole })
      );

      await Promise.all(updatePromises);
      toast.success(
        tWithParams("userManagement.roleUpdateSuccess", {
          role: selectedRole,
          count: selectedUsers.length,
        })
      );
      refetch();
      setRoleChangeOpen(false);
      setSelectedRole("");
    } catch (error) {
      toast.error(t("userManagement.failedToUpdateRoles"));
      console.error(error);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await adminService.deleteMultipleUsers(selectedUsers);
      toast.success(
        tWithParams("userManagement.deleteSuccess", {
          count: selectedUsers.length,
        })
      );
      handleMultipleDeleted();
    } catch (error) {
      toast.error(t("userManagement.failedToDelete"));
      console.error(error);
    }
  };

  // Handle user edit using the direct modal
  const handleEditUser = async (userId: number, userData: any) => {
    try {
      await adminService.updateUser(userId, userData);
      refetch();
      return Promise.resolve();
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      return Promise.reject(error);
    }
  };

  // Handle email edit using the direct modal
  const handleEditUserEmail = async (userId: number, newEmail: string) => {
    try {
      await adminService.updateUserEmail(userId, newEmail);
      refetch();
      handleUserEmailEdited();
      return Promise.resolve();
    } catch (error) {
      console.error(`Failed to update email for user ${userId}:`, error);
      return Promise.reject(error);
    }
  };

  // Professional filter/search bar styling
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter options
  const statusOptions = [
    { id: "any", label: t("userManagement.anyStatus"), value: "any" },
    { id: "active", label: t("userManagement.active"), value: "active" },
    { id: "inactive", label: t("userManagement.inactive"), value: "inactive" },
  ];
  const roleOptions = [
    { id: "any", label: t("userManagement.anyRole"), value: "any" },
    { id: "Admin", label: t("userManagement.admin"), value: "Admin" },
    { id: "FullUser", label: t("userManagement.fullUser"), value: "FullUser" },
    {
      id: "SimpleUser",
      label: t("userManagement.simpleUser"),
      value: "SimpleUser",
    },
  ];

  // Apply filters immediately when changed
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("any");
    setRoleFilter("any");
    setSearchQuery("");
    setFilterOpen(false); // Close popover after clearing
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        {t("userManagement.errorLoading")}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Document-style Search + Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {DEFAULT_USER_SEARCH_FIELDS.find(
                    (opt) => opt.id === searchField
                  )?.label || t("userManagement.allFields")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {DEFAULT_USER_SEARCH_FIELDS.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id as string}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <Input
              placeholder={t("userManagement.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
              <svg
                className="h-5 w-5"
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
        {/* Filter popover */}
        <div className="flex items-center gap-3">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
              >
                <Filter className="h-5 w-5" />
                {t("userManagement.filter")}
                {(statusFilter !== "any" || roleFilter !== "any") && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                {t("userManagement.advancedFilters")}
              </div>
              <div className="flex flex-col gap-4">
                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">
                    {t("userManagement.status")}
                  </span>
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                      <SelectValue>
                        {
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                      {statusOptions.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Role Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">
                    {t("userManagement.role")}
                  </span>
                  <Select value={roleFilter} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                      <SelectValue>
                        {
                          roleOptions.find((opt) => opt.value === roleFilter)
                            ?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                      {roleOptions.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                {(statusFilter !== "any" || roleFilter !== "any") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4" /> {t("userManagement.clearAll")}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <UserTableContent
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectAll={() => handleSelectAll(filteredUsers || [])}
          onSelectUser={handleSelectUser}
          onToggleStatus={handleToggleUserStatus}
          onRoleChange={handleUserRoleChange}
          onEdit={(user) => {
            console.log("Editing user:", user);
            setEditingUser(user);
            setDirectEditModalOpen(true);
          }}
          onEditEmail={(user) => {
            console.log("Editing email for user:", user);
            setEditEmailUser(user);
            setDirectEditEmailModalOpen(true);
          }}
          onViewLogs={setViewingUserLogs}
          onDelete={setDeletingUser}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onChangeRole={() => setRoleChangeOpen(true)}
          onDelete={() => setDeleteMultipleOpen(true)}
        />
      )}

      {/* Direct Edit Modal */}
      <DirectEditUserModal
        user={editingUser}
        isOpen={directEditModalOpen}
        onClose={() => {
          setDirectEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleEditUser}
      />

      {/* Direct Email Edit Modal */}
      <DirectEditUserEmailModal
        user={editEmailUser}
        isOpen={directEditEmailModalOpen}
        onClose={() => {
          setDirectEditEmailModalOpen(false);
          setEditEmailUser(null);
        }}
        onSave={handleEditUserEmail}
      />

      {viewingUserLogs !== null && (
        <ViewUserLogsDialog
          userId={viewingUserLogs}
          open={viewingUserLogs !== null}
          onOpenChange={(open) => !open && setViewingUserLogs(null)}
        />
      )}

      {deletingUser !== null && (
        <DeleteConfirmDialog
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          open={deletingUser !== null}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onConfirm={async () => {
            try {
              if (deletingUser) {
                await adminService.deleteUser(deletingUser);
                toast.success("User deleted successfully");
                setDeletingUser(null);
                refetch();
              }
            } catch (error) {
              toast.error("Failed to delete user");
              console.error(error);
            }
          }}
        />
      )}

      {deleteMultipleOpen && (
        <BulkDeleteDialog
          open={deleteMultipleOpen}
          onOpenChange={setDeleteMultipleOpen}
          onConfirm={handleDeleteMultiple}
          selectedCount={selectedUsers.length}
        />
      )}

      {roleChangeOpen && (
        <BulkRoleChangeDialog
          open={roleChangeOpen}
          onOpenChange={setRoleChangeOpen}
          onConfirm={handleBulkRoleChange}
          selectedCount={selectedUsers.length}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}
    </div>
  );
}
