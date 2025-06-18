import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Trash2,
  Search,
  UserCog,
  User,
  UserPlus,
  LayoutGrid,
  LayoutList,
  UserX,
  CheckCircle2,
  Filter,
  PencilIcon,
  AlertCircle,
  UserCheck,
  MessageSquare,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/ui/badge";
import approvalService from "@/services/approvalService";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { UserOption } from "@/components/user/UserSearchSelect";
import ApproverCreateWizard from "@/components/approval/ApproverCreateWizard";
import ApproverEditWizard from "@/components/approval/ApproverEditWizard";
import {
  UnifiedTable,
  BulkAction,
  Column,
} from "@/components/admin/table/UnifiedTable";
import { ApprovalActionsDropdown } from "@/components/approval/ApprovalActionsDropdown";
import { ApprovalBulkActionsBar } from "@/components/approval/ApprovalBulkActionsBar";
import { AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
  allAssociations?: { stepId: number; stepTitle: string }[];
}

interface CreateApproverRequest {
  userId: number;
  stepId?: number;
  comment?: string;
}

export default function ApproversManagement() {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [filteredApprovers, setFilteredApprovers] = useState<Approver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [approverToEdit, setApproverToEdit] = useState<Approver | null>(null);
  const [approverToDelete, setApproverToDelete] = useState<Approver | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Define table columns
  const columns: Column<Approver>[] = [
    {
      id: "username",
      header: "Approver",
      accessorKey: "username",
      cell: (item) => (
        <div className="font-medium text-blue-200 flex items-center">
          <User className="h-4 w-4 mr-2 text-blue-400" />
          {item.username}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "comment",
      header: "Comment",
      accessorKey: "comment",
      cell: (item) => (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-blue-400/70" />
          {item.comment ? (
            <span className="text-blue-200">{item.comment}</span>
          ) : (
            <span className="text-blue-300/50 text-sm italic">No comment</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessorKey: "id",
      isAction: true,
      cell: (item) => {
        const isAssociated = !!item.stepId;
        const disabledTooltip = isAssociated 
          ? `This approver is currently associated with step: ${item.stepTitle}`
          : "";
        
        return (
          <ApprovalActionsDropdown
            item={item}
            onEdit={() => handleEditApprover(item)}
            onDelete={() => openDeleteDialog(item)}
            isEditDisabled={isAssociated}
            isDeleteDisabled={isAssociated}
            disabledTooltip={disabledTooltip}
          />
        );
      },
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
    { id: "username", label: "Username" },
    { id: "comment", label: "Comment" },
  ];

  // Fetch approvers on component mount
  useEffect(() => {
    fetchApprovers();
  }, []);

  // Handle selecting all approvers when selectAll changes
  useEffect(() => {
    if (selectAll) {
      setSelectedApprovers(filteredApprovers.map((approver) => approver.id));
    } else {
      setSelectedApprovers([]);
    }
  }, [selectAll, filteredApprovers]);

  // Filter approvers based on search criteria
  useEffect(() => {
    let filtered = [...approvers];

    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      if (searchField === "all") {
        filtered = filtered.filter(
          (approver) =>
            approver.username.toLowerCase().includes(query) ||
            approver.comment?.toLowerCase().includes(query)
        );
      } else if (searchField === "username") {
        filtered = filtered.filter((approver) =>
          approver.username.toLowerCase().includes(query)
        );
      } else if (searchField === "comment") {
        filtered = filtered.filter((approver) =>
          approver.comment?.toLowerCase().includes(query)
        );
      }
    }

    setFilteredApprovers(filtered);
  }, [searchQuery, searchField, approvers]);

  const fetchApprovers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both approvers and step configurations
      const [approversResponse, stepsWithApprovalResponse] = await Promise.all([
        approvalService.getAllApprovators(),
        approvalService.getStepsWithApproval()
      ]);
      
      // Create a map of approvator ID to step associations
      const userStepAssociations = new Map();
      
      // Fetch detailed approval configuration for each step
      const stepConfigPromises = stepsWithApprovalResponse
        .filter((step: any) => step.requiresApproval) // Only check steps that require approval
        .map(async (step: any) => {
          try {
            const stepConfig = await approvalService.getStepApprovalConfig(step.stepId);
            return { step, config: stepConfig };
          } catch (error) {
            return { step, config: null };
          }
        });
      
      const stepConfigs = await Promise.all(stepConfigPromises);
      
      // Process each step configuration to find approver associations
      stepConfigs.forEach(({ step, config }) => {
        if (!config) return;
        
        // Check if step has single approver configuration
        if (config.singleApproverId) {
          const existingSteps = userStepAssociations.get(config.singleApproverId) || [];
          userStepAssociations.set(config.singleApproverId, [
            ...existingSteps,
            { stepId: step.stepId, stepTitle: step.title }
          ]);
        }
        
        // Check if step has approval groups with individual approvers
        if (config.approvers && Array.isArray(config.approvers)) {
          config.approvers.forEach((approver: any) => {
            const approvatorId = approver.id; // Use approvator ID
            if (approvatorId) {
              const existingSteps = userStepAssociations.get(approvatorId) || [];
              userStepAssociations.set(approvatorId, [
                ...existingSteps,
                { stepId: step.stepId, stepTitle: step.title }
              ]);
            }
          });
        }
        
        // Check for other possible approver fields
        if (config.approverId) {
          const existingSteps = userStepAssociations.get(config.approverId) || [];
          userStepAssociations.set(config.approverId, [
            ...existingSteps,
            { stepId: step.stepId, stepTitle: step.title }
          ]);
        }
      });
      
      // Merge association data with approvers
      const enrichedApprovers = approversResponse.map((approver: any) => {
        // Use approver.id (approvator ID) instead of approver.userId for lookup
        const associations = userStepAssociations.get(approver.id);
        if (associations && associations.length > 0) {
          // For simplicity, use the first association for stepId and stepTitle
          // In reality, an approver might be associated with multiple steps
          return {
            ...approver,
            stepId: associations[0].stepId,
            stepTitle: associations[0].stepTitle,
            allAssociations: associations // Keep all associations for future use
          };
        }
        return approver;
      });
      
      setApprovers(enrichedApprovers);
      setFilteredApprovers(enrichedApprovers);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
      toast.error("Failed to load approvers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApprover = async () => {
    if (!approverToDelete) return;

    try {
      await approvalService.deleteApprovator(approverToDelete.id);
      setApprovers((prev) =>
        prev.filter((approver) => approver.id !== approverToDelete.id)
      );
      toast.success(
        `Approver "${approverToDelete.username}" deleted successfully`
      );
    } catch (error) {
      console.error(
        `Failed to delete approver with ID ${approverToDelete.id}:`,
        error
      );
      toast.error("Failed to delete approver");
    } finally {
      setApproverToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApprovers.length === 0) return;

    try {
      // Delete one by one
      const deletePromises = selectedApprovers.map((id) =>
        approvalService.deleteApprovator(id)
      );

      await Promise.all(deletePromises);

      setApprovers((prev) =>
        prev.filter((approver) => !selectedApprovers.includes(approver.id))
      );

      toast.success(
        `${selectedApprovers.length} approvers deleted successfully`
      );
      setSelectedApprovers([]);
    } catch (error) {
      console.error("Failed to delete approvers:", error);
      toast.error("Failed to delete approvers");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (approver: Approver) => {
    setApproverToDelete(approver);
    setDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(true);
  };

  const resetForm = () => {
    // This function is kept for compatibility with the onOpenChange handler
    // but no longer needs to reset any form fields
  };

  const toggleApproverSelection = (id: number) => {
    setSelectedApprovers((prev) =>
      prev.includes(id)
        ? prev.filter((approverId) => approverId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleViewModeChange = (mode: "list" | "card") => {
    // Force a re-render by using a state update function
    setViewMode((currentMode) => {
      // Only reset selection if the mode is actually changing
      if (currentMode !== mode) {
        setSelectedApprovers([]);
        setSelectAll(false);
      }
      return mode;
    });

    // Log to console for debugging purposes
    console.log(`View mode changed to: ${mode}`);
  };

  const handleBulkActions = (action: string, selectedItems: Approver[]) => {
    if (action === "delete") {
      openBulkDeleteDialog();
    }
  };

  const handleRowSelect = (ids: (string | number)[]) => {
    setSelectedApprovers(ids as number[]);
  };

  const handleEditApprover = (approver: Approver) => {
    setApproverToEdit(approver);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchApprovers();
    setEditDialogOpen(false);
    setApproverToEdit(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSearchField("all");
  };

  const emptyState = (
    <div className="text-center py-6">
      <UserCheck className="h-12 w-12 text-blue-500/50 mx-auto mb-3" />
      <h3 className="text-xl font-medium text-blue-300 mb-2">
        No Approvers Found
      </h3>
      <p className="text-blue-400 mb-4">
        Get started by adding your first approver
      </p>
      <Button
        onClick={() => setCreateDialogOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Approver
      </Button>
    </div>
  );

  // Create a "New Approver" button for the header action
  const headerAction = (
    <Button
      onClick={() => setCreateDialogOpen(true)}
      className="bg-blue-600 hover:bg-blue-700"
      size="sm"
    >
      <UserPlus className="h-4 w-4 mr-1" />
      New Approver
    </Button>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header Section - styled consistently with UserManagement */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <UserCog className="mr-3 h-6 w-6 text-blue-400" /> Approvers
              Management
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage individual approvers for document workflows
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            New Approver
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
                placeholder="Search approvers..."
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

          {/* Filter popover - including for future expansion */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2 ml-2"
              >
                <Filter className="h-4 w-4 text-blue-400" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1e2a4a] border border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
              <div className="mb-2 text-blue-200 font-semibold flex justify-between items-center">
                <span>Filters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                >
                  Clear All
                </Button>
              </div>

              <div className="text-sm text-blue-400 mt-4 text-center">
                Additional filters will be added in future updates
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Unified Table Component - with improved spacing and hiding search */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg overflow-hidden shadow-lg">
        <UnifiedTable
          data={filteredApprovers}
          columns={columns}
          keyField="id"
          title="Approvers"
          subtitle="Manage your document workflow approvers"
          isLoading={isLoading}
          bulkActions={[]}
          showViewToggle={true}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedItems={selectedApprovers}
          onSelectItems={setSelectedApprovers}
          emptyState={emptyState}
          headerAction={headerAction}
          // Don't pass search props to hide the built-in search in UnifiedTable
        />
      </div>

      {/* Approver Create Dialog */}
      <ApproverCreateWizard
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          fetchApprovers();
          setCreateDialogOpen(false);
        }}
      />

      {/* Approver Edit Dialog */}
      {approverToEdit && (
        <ApproverEditWizard
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
          approver={approverToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Approver</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete the approver "
              {approverToDelete?.username}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-blue-200 border border-blue-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApprover}
              className="bg-red-900/70 hover:bg-red-900 text-red-100"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedApprovers.length}{" "}
              selected approvers? This action cannot be undone.
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
              Delete {selectedApprovers.length} Approvers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedApprovers.length > 0 && (
          <ApprovalBulkActionsBar
            selectedCount={selectedApprovers.length}
            onDelete={openBulkDeleteDialog}
            entityName="approvers"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
