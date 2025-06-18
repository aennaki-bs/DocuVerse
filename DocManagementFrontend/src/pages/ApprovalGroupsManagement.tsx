import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UsersRound,
  ShieldAlert,
  Info,
  PencilIcon,
  Trash2,
  UserPlus,
  AlertTriangle,
  Users,
  Search,
  Filter,
  X,
} from "lucide-react";
import { ApprovalGroup } from "@/models/approval";
import approvalService from "@/services/approvalService";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UnifiedTable,
  Column,
  BulkAction,
} from "@/components/admin/table/UnifiedTable";
import ApprovalGroupCreateDialog from "@/components/approval/ApprovalGroupCreateDialog";
import ApprovalGroupEditDialog from "@/components/approval/ApprovalGroupEditDialog";
import ApprovalGroupViewDialog from "@/components/approval/ApprovalGroupViewDialog";
import { ApprovalActionsDropdown } from "@/components/approval/ApprovalActionsDropdown";
import { ApprovalBulkActionsBar } from "@/components/approval/ApprovalBulkActionsBar";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ApprovalGroupsManagement() {
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ApprovalGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(
    null
  );
  const [groupToDelete, setGroupToDelete] = useState<ApprovalGroup | null>(
    null
  );
  const [associatedGroups, setAssociatedGroups] = useState<
    Record<number, boolean>
  >({});
  const [checkingAssociation, setCheckingAssociation] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Fetch approval groups on component mount
  useEffect(() => {
    fetchApprovalGroups();
  }, []);

  // Check group associations after groups are loaded
  useEffect(() => {
    if (approvalGroups.length > 0) {
      checkGroupAssociations();
    }
  }, [approvalGroups]);

  // Filter groups based on search and filter criteria
  useEffect(() => {
    let filtered = [...approvalGroups];

    // Apply rule type filter
    if (ruleTypeFilter !== "any") {
      filtered = filtered.filter((group) => group.ruleType === ruleTypeFilter);
    }

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      if (searchField === "all") {
        filtered = filtered.filter(
          (group) =>
            group.name.toLowerCase().includes(query) ||
            group.comment?.toLowerCase().includes(query) ||
            group.stepTitle?.toLowerCase().includes(query) ||
            group.ruleType.toLowerCase().includes(query)
        );
      } else if (searchField === "name") {
        filtered = filtered.filter((group) =>
          group.name.toLowerCase().includes(query)
        );
      } else if (searchField === "comment") {
        filtered = filtered.filter((group) =>
          group.comment?.toLowerCase().includes(query)
        );
      } else if (searchField === "ruleType") {
        filtered = filtered.filter((group) =>
          group.ruleType.toLowerCase().includes(query)
        );
      }
    }

    setFilteredGroups(filtered);
  }, [searchQuery, searchField, ruleTypeFilter, approvalGroups]);

  // Define table columns
  const columns: Column<ApprovalGroup>[] = [
    {
      id: "name",
      header: "Group Name",
      accessorKey: "name",
      cell: (item) => (
        <div className="font-medium text-blue-200 flex items-center">
          <UsersRound className="h-4 w-4 mr-2 text-blue-400" />
          {item.name}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "ruleType",
      header: "Approval Rule",
      accessorKey: "ruleType",
      cell: (item) => (
        <Badge
          className={`${
            item.ruleType === "All"
              ? "bg-emerald-600/60 text-emerald-100"
              : item.ruleType === "Any"
              ? "bg-amber-600/60 text-amber-100"
              : "bg-blue-600/60 text-blue-100"
          }`}
        >
          {item.ruleType === "All"
            ? "All Must Approve"
            : item.ruleType === "Any"
            ? "Any Can Approve"
            : "Sequential"}
        </Badge>
      ),
    },
    {
      id: "comment",
      header: "Comment",
      accessorKey: "comment",
      cell: (item) => (
        <>
          {item.comment ? (
            <span className="text-blue-200">{item.comment}</span>
          ) : (
            <span className="text-blue-300/50 text-sm italic">No comment</span>
          )}
        </>
      ),
    },
    {
      id: "approversCount",
      header: "Approvers",
      accessorKey: "approvers",
      cell: (item) => (
        <Badge className="bg-blue-800/60 text-blue-100">
          {item.approvers?.length || 0}{" "}
          {item.approvers?.length === 1 ? "member" : "members"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessorKey: "id",
      isAction: true,
      cell: (item) => (
        <ApprovalActionsDropdown
          item={item}
          onView={() => handleViewDetails(item)}
          onEdit={() => handleEditGroup(item)}
          onDelete={() => openDeleteDialog(item)}
          isEditDisabled={associatedGroups[item.id] || checkingAssociation}
          isDeleteDisabled={associatedGroups[item.id] || checkingAssociation}
          disabledTooltip="Cannot modify a group that is associated with workflow steps"
        />
      ),
    },
  ];

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4 mr-1" />,
      variant: "destructive",
      onClick: () => openBulkDeleteDialog(),
    },
  ];

  // Search fields
  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "name", label: "Group Name" },
    { id: "comment", label: "Comment" },
    { id: "ruleType", label: "Rule Type" },
  ];

  // Filter options
  const ruleTypeOptions = [
    { id: "any", label: "Any Rule Type", value: "any" },
    { id: "All", label: "All Must Approve", value: "All" },
    { id: "Any", label: "Any Can Approve", value: "Any" },
    { id: "Sequential", label: "Sequential", value: "Sequential" },
  ];

  const fetchApprovalGroups = async () => {
    try {
      setIsLoading(true);
      const data = await approvalService.getAllApprovalGroups();
      setApprovalGroups(data);
      setFilteredGroups(data);
    } catch (error) {
      console.error("Failed to fetch approval groups:", error);
      toast.error("Failed to load approval groups");
    } finally {
      setIsLoading(false);
    }
  };

  const checkGroupAssociations = async () => {
    try {
      setCheckingAssociation(true);
      const associationMap: Record<number, boolean> = {};

      // Check association for each group in parallel
      const associationPromises = approvalGroups.map(async (group) => {
        try {
          const association = await approvalService.checkGroupAssociation(
            group.id
          );
          associationMap[group.id] = association.isAssociated;
        } catch (error) {
          console.error(
            `Failed to check association for group ${group.id}:`,
            error
          );
          // Default to true (cannot delete) if check fails
          associationMap[group.id] = true;
        }
      });

      await Promise.all(associationPromises);
      setAssociatedGroups(associationMap);
    } catch (error) {
      console.error("Failed to check group associations:", error);
    } finally {
      setCheckingAssociation(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await approvalService.deleteApprovalGroup(groupToDelete.id);

      setApprovalGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupToDelete.id)
      );

      toast.success(
        `Approval group "${groupToDelete.name}" deleted successfully`
      );

      // Remove the deleted group from selected groups if it was selected
      setSelectedGroups((prev) => prev.filter((id) => id !== groupToDelete.id));
    } catch (error) {
      console.error(
        `Failed to delete approval group with ID ${groupToDelete.id}:`,
        error
      );
      toast.error("Failed to delete approval group");
    } finally {
      setGroupToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (group: ApprovalGroup) => {
    if (associatedGroups[group.id]) {
      toast.error(
        "Cannot delete a group that is associated with workflow steps"
      );
      return;
    }
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleCreateGroupSuccess = () => {
    fetchApprovalGroups();
    setCreateDialogOpen(false);
  };

  const handleBulkDelete = async () => {
    if (selectedGroups.length === 0) return;

    try {
      // Filter out groups that are associated with workflow steps
      const eligibleGroups = selectedGroups.filter(
        (id) => !associatedGroups[id]
      );

      if (eligibleGroups.length === 0) {
        toast.error(
          "None of the selected groups can be deleted as they are all associated with workflow steps"
        );
        setBulkDeleteDialogOpen(false);
        return;
      }

      if (eligibleGroups.length !== selectedGroups.length) {
        toast.warning(
          "Some groups cannot be deleted as they are associated with workflow steps"
        );
      }

      // Delete groups in parallel
      const deletePromises = eligibleGroups.map((id) =>
        approvalService.deleteApprovalGroup(id)
      );

      await Promise.all(deletePromises);

      setApprovalGroups((prevGroups) =>
        prevGroups.filter((group) => !eligibleGroups.includes(group.id))
      );

      toast.success(
        `${eligibleGroups.length} approval groups deleted successfully`
      );
      setSelectedGroups([]);
    } catch (error) {
      console.error("Failed to delete approval groups:", error);
      toast.error("Failed to delete selected approval groups");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const openBulkDeleteDialog = () => {
    // Count how many selected groups are eligible for deletion
    const eligibleGroups = selectedGroups.filter((id) => !associatedGroups[id]);

    if (eligibleGroups.length === 0) {
      toast.error(
        "None of the selected groups can be deleted as they are all associated with workflow steps"
      );
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const handleViewModeChange = (mode: "list" | "card") => {
    setViewMode(mode);
  };

  const handleViewDetails = (group: ApprovalGroup) => {
    setSelectedGroup(group);
    setDetailsDialogOpen(true);
  };

  const handleEditGroup = (group: ApprovalGroup) => {
    if (associatedGroups[group.id]) {
      toast.error("Cannot edit a group that is associated with workflow steps");
      return;
    }
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const handleEditGroupSuccess = () => {
    fetchApprovalGroups();
    setEditDialogOpen(false);
    setSelectedGroup(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setRuleTypeFilter("any");
    setFilterOpen(false);
  };

  const emptyState = (
    <div className="text-center py-6">
      <Users className="h-12 w-12 text-blue-500/50 mx-auto mb-3" />
      <h3 className="text-xl font-medium text-blue-300 mb-2">
        No Approval Groups Found
      </h3>
      <p className="text-blue-400 mb-4">
        Get started by adding your first approval group
      </p>
      <Button
        onClick={() => setCreateDialogOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Approval Group
      </Button>
    </div>
  );

  // Create a "New Approval Group" button for the header action
  const headerAction = (
    <Button
      onClick={() => setCreateDialogOpen(true)}
      className="bg-blue-600 hover:bg-blue-700"
      size="sm"
    >
      <UserPlus className="h-4 w-4 mr-1" />
      New Group
    </Button>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header Section - styled consistently with UserManagement */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <UsersRound className="mr-3 h-6 w-6 text-blue-400" /> Approval
              Groups
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage approval groups for document workflows
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            New Approval Group
          </Button>
        </div>
      </div>

      {/* Modern Search UI similar to UserManagement */}
      <div className="bg-[#1e2a4a] border border-blue-900/40 rounded-xl p-4 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
                <SelectValue>
                  {searchFields.find((field) => field.id === searchField)
                    ?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                {searchFields.map((field) => (
                  <SelectItem
                    key={field.id}
                    value={field.id}
                    className="hover:bg-blue-800/40"
                  >
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                placeholder="Search approval groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2 ml-2"
              >
                <Filter className="h-4 w-4 text-blue-400" />
                Filter
                {ruleTypeFilter !== "any" && (
                  <Badge className="ml-1 bg-blue-600 text-white px-1.5 py-0.5 text-xs">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
              <div className="mb-2 text-blue-200 font-semibold flex justify-between items-center">
                <span>Filters</span>
                {ruleTypeFilter !== "any" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Rule Type Filter */}
              <div className="flex flex-col gap-1 mt-3">
                <span className="text-sm text-blue-200">Rule Type</span>
                <Select
                  value={ruleTypeFilter}
                  onValueChange={setRuleTypeFilter}
                >
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
                    <SelectValue>
                      {ruleTypeOptions.find(
                        (opt) => opt.value === ruleTypeFilter
                      )?.label || "Any Rule Type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {ruleTypeOptions.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={opt.value}
                        className="hover:bg-blue-800/40"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Display active filters */}
        {ruleTypeFilter !== "any" && (
          <div className="flex gap-2 mt-3">
            <Badge className="bg-blue-800/60 text-blue-200 px-2.5 py-1 flex items-center gap-1">
              Rule Type:{" "}
              {
                ruleTypeOptions.find((opt) => opt.value === ruleTypeFilter)
                  ?.label
              }
              <button
                className="ml-1.5 hover:text-white"
                onClick={() => setRuleTypeFilter("any")}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Unified Table Component - with improved spacing and hiding search */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg overflow-hidden shadow-lg">
        <UnifiedTable
          data={filteredGroups}
          columns={columns}
          keyField="id"
          title="Approval Groups"
          subtitle="Manage groups for document approval workflows"
          isLoading={isLoading}
          bulkActions={[]}
          showViewToggle={true}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedItems={selectedGroups}
          onSelectItems={setSelectedGroups}
          emptyState={emptyState}
          headerAction={headerAction}
          // Don't pass search props to hide the built-in search in UnifiedTable
        />
      </div>

      {/* Dialogs */}
      {/* Create Group Dialog */}
      <ApprovalGroupCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateGroupSuccess}
      />

      {/* Edit Group Dialog */}
      {selectedGroup && (
        <ApprovalGroupEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          group={selectedGroup}
          onSuccess={handleEditGroupSuccess}
        />
      )}

      {/* View Group Details Dialog */}
      {selectedGroup && (
        <ApprovalGroupViewDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          group={selectedGroup}
          isAssociated={associatedGroups[selectedGroup.id] || false}
        />
      )}

      {/* Delete Group Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Group</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete the approval group "
              {groupToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-blue-200 border border-blue-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-red-900/70 hover:bg-red-900 text-red-100"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete the selected approval groups? This
              action cannot be undone.
              {selectedGroups.some((id) => associatedGroups[id]) && (
                <div className="mt-2 text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Some selected groups cannot be deleted as they are
                    associated with workflow steps.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-blue-200 border border-blue-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-900/70 hover:bg-red-900 text-red-100"
            >
              Delete Groups
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedGroups.length > 0 && (
          <ApprovalBulkActionsBar
            selectedCount={selectedGroups.length}
            onDelete={openBulkDeleteDialog}
            entityName="groups"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
