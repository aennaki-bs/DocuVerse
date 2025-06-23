import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calculator,
  Filter,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Loader2,
  X,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  GeneralAccounts,
  LignesElementType,
  CreateGeneralAccountsRequest,
  UpdateGeneralAccountsRequest,
} from "@/models/lineElements";

// Import the new wizard component
import CreateGeneralAccountWizard from "./CreateGeneralAccountWizard";

// Form validation schema
const generalAccountSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be 255 characters or less"),
});

type GeneralAccountFormData = z.infer<typeof generalAccountSchema>;

// Search field options
const GENERAL_ACCOUNT_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Code" },
  { id: "description", label: "Description" },
  { id: "accountType", label: "Account Type" },
];

interface GeneralAccountsManagementProps {
  searchTerm: string;
  elementType?: LignesElementType;
}

const GeneralAccountsManagement = ({
  searchTerm,
  elementType,
}: GeneralAccountsManagementProps) => {
  const [accounts, setAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof GeneralAccounts>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<GeneralAccounts | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const editForm = useForm<GeneralAccountFormData>({
    resolver: zodResolver(generalAccountSchema),
    defaultValues: {
      code: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await lineElementsService.generalAccounts.getAll();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch general accounts:", error);
      toast.error("Failed to load general accounts data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter((account) => {
      // Search filter
      const searchValue = searchQuery.toLowerCase();
      let matchesSearch = true;

      if (searchValue) {
        switch (searchField) {
          case "code":
            matchesSearch = account.code.toLowerCase().includes(searchValue);
            break;
          case "description":
            matchesSearch = account.description
              .toLowerCase()
              .includes(searchValue);
            break;
          case "accountType":
            matchesSearch = (account.accountType || "").toLowerCase().includes(searchValue);
            break;
          default: // 'all'
            matchesSearch =
              account.code.toLowerCase().includes(searchValue) ||
              account.description.toLowerCase().includes(searchValue) ||
              (account.accountType || "").toLowerCase().includes(searchValue);
        }
      }

      // Global search term from parent
      if (searchTerm && !searchValue) {
        matchesSearch =
          account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (account.accountType || "").toLowerCase().includes(searchTerm.toLowerCase());
      }

      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "code":
          aValue = a.code;
          bValue = b.code;
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "accountType":
          aValue = a.accountType || "";
          bValue = b.accountType || "";
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.code;
          bValue = b.code;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    accounts,
    searchQuery,
    searchField,
    searchTerm,
    sortField,
    sortDirection,
  ]);

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedAccounts,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredAndSortedAccounts,
    initialPageSize: 25,
  });

  const handleSort = (field: keyof GeneralAccounts) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof GeneralAccounts) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof GeneralAccounts) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  // Checkbox selection handlers
  const handleSelectAll = () => {
    const currentPageCodes = paginatedAccounts.map((account) => account.code);
    const selectedOnCurrentPage = selectedAccounts.filter((code) =>
      currentPageCodes.includes(code)
    );

    if (selectedOnCurrentPage.length === currentPageCodes.length) {
      // Deselect all on current page
      setSelectedAccounts((prev) =>
        prev.filter((code) => !currentPageCodes.includes(code))
      );
    } else {
      // Select all on current page
      setSelectedAccounts((prev) => [
        ...prev.filter((code) => !currentPageCodes.includes(code)),
        ...currentPageCodes,
      ]);
    }
  };

  const handleSelectAccount = (accountCode: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountCode)
        ? prev.filter((code) => code !== accountCode)
        : [...prev, accountCode]
    );
  };

  const handleBulkDelete = async () => {
    const results: { code: string; success: boolean; error?: string }[] = [];

    try {
      // Process deletions individually to track success/failure
      for (const code of selectedAccounts) {
        try {
          await lineElementsService.generalAccounts.delete(code);
          results.push({ code, success: true });
        } catch (error: any) {
          const errorMessage =
            error.response?.data || error.message || "Unknown error";
          results.push({ code, success: false, error: errorMessage });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      if (successCount > 0 && failureCount === 0) {
        toast.success(`${successCount} account(s) deleted successfully`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(
          `${successCount} account(s) deleted, ${failureCount} failed. Some accounts may not exist or are in use.`
        );
      } else {
        toast.error(
          `Failed to delete all ${failureCount} account(s). They may not exist or are in use.`
        );
      }

      // Clear selection and refresh data regardless of partial failures
      setSelectedAccounts([]);
      setIsBulkDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to delete accounts:", error);
      toast.error("An unexpected error occurred during bulk deletion");
    }
  };

  const handleEditAccount = async (data: GeneralAccountFormData) => {
    if (!selectedAccount) return;

    try {
      // Only validate code format if it has changed and account is not in use
      if (
        selectedAccount.lignesCount === 0 &&
        data.code.trim() !== selectedAccount.code
      ) {
        const codeValue = data.code.trim();

        // Check alphanumeric format
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(codeValue)) {
          toast.error("Code must be alphanumeric (letters and numbers only)");
          return;
        }

        // Check length
        if (codeValue.length < 1 || codeValue.length > 20) {
          toast.error("Code must be between 1 and 20 characters");
          return;
        }
      }

      const updateRequest: UpdateGeneralAccountsRequest = {
        // Only send code if account is not in use
        ...(selectedAccount.lignesCount === 0 && { code: data.code.trim() }),
        description: data.description.trim(),
      };

      await lineElementsService.generalAccounts.update(
        selectedAccount.code,
        updateRequest
      );
      toast.success("General account updated successfully");
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      editForm.reset();
      fetchData();
    } catch (error: any) {
      console.error("Failed to update general account:", error);
      toast.error(
        error.response?.data?.message || "Failed to update general account"
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    try {
      await lineElementsService.generalAccounts.delete(selectedAccount.code);
      toast.success("General account deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
      fetchData();
    } catch (error: any) {
      console.error("Failed to delete general account:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete general account"
      );
    }
  };

  const openEditDialog = (account: GeneralAccounts) => {
    setSelectedAccount(account);
    editForm.reset({
      code: account.code,
      description: account.description,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (account: GeneralAccounts) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (account: GeneralAccounts) => {
    setSelectedAccount(account);
    setIsViewDialogOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterOpen(false);
  };

  // Filter card class
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-2 p-4 mb-4 rounded-xl bg-blue-50 dark:bg-[#1e2a4a] shadow-lg border border-blue-200 dark:border-blue-900/40";

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-blue-700 dark:text-blue-300 font-medium">
            Loading general accounts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[120px] bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {GENERAL_ACCOUNT_SEARCH_FIELDS.find(
                  (opt) => opt.id === searchField
                )?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40">
              {GENERAL_ACCOUNT_SEARCH_FIELDS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="hover:bg-blue-100 dark:hover:bg-blue-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search general accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm placeholder:text-blue-500 dark:placeholder:text-blue-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Create button */}
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled
          >
            <Plus className="h-4 w-4" />
            Create General Account
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 overflow-hidden  dark:bg-gradient-to-b dark:from-[#1a2c6b]/50 dark:to-[#0a1033]/50 shadow-lg">
        {filteredAndSortedAccounts.length > 0 ? (
          <>
            {/* Fixed Header - Never Scrolls */}
            <div className="min-w-[1000px] border-b border-blue-200 dark:border-blue-900/30">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-blue-50 dark:bg-gradient-to-r dark:from-[#1a2c6b] dark:to-[#0a1033]">
                  <TableRow className="border-blue-200 dark:border-blue-900/30 hover:bg-transparent">
                    <TableHead className="w-[50px]">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={
                            paginatedAccounts.length > 0 &&
                            paginatedAccounts.every((account) =>
                              selectedAccounts.includes(account.code)
                            )
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className={`${headerClass("code")} w-[150px]`}
                      onClick={() => handleSort("code")}
                    >
                      <div className="flex items-center">
                        Code {renderSortIcon("code")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={`${headerClass("description")} w-[350px]`}
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center">
                        Description {renderSortIcon("description")}
                      </div>
                    </TableHead>
                    <TableHead
                      className={`${headerClass("accountType")} w-[200px]`}
                      onClick={() => handleSort("accountType")}
                    >
                      <div className="flex items-center">
                        Account Type {renderSortIcon("accountType")}
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px] text-blue-800 dark:text-blue-200 font-medium text-right pr-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
              <div className="min-w-[1000px]">
                <Table className="table-fixed w-full">
                  <TableBody>
                    {paginatedAccounts.map((account) => (
                      <TableRow
                        key={account.code}
                        className="border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/20 transition-colors duration-150"
                      >
                        <TableCell className="w-[50px]">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selectedAccounts.includes(account.code)}
                              onCheckedChange={() =>
                                handleSelectAccount(account.code)
                              }
                              aria-label={`Select ${account.code}`}
                              className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="w-[150px] font-mono text-blue-900 dark:text-blue-100 font-semibold">
                          {account.code}
                        </TableCell>
                        <TableCell className="w-[350px] text-blue-800 dark:text-blue-200">
                          <div className="truncate">{account.description}</div>
                        </TableCell>
                        <TableCell className="w-[200px] text-blue-800 dark:text-blue-200">
                          <div className="truncate">{account.accountType || "N/A"}</div>
                        </TableCell>
                        <TableCell className="w-[150px] text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(account)}
                              className="h-8 w-8 p-0 text-blue-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/10"
                              title="View general account details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(account)}
                              disabled={account.lignesCount > 0}
                              className={`h-8 w-8 p-0 ${
                                account.lignesCount > 0
                                  ? "opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-400"
                                  : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30"
                              }`}
                              title={
                                account.lignesCount > 0
                                  ? "Cannot edit: Account is used in document lines"
                                  : "Edit general account"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(account)}
                              disabled
                              className="h-8 w-8 p-0 opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-400"
                              title="Delete functionality disabled"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-blue-700 dark:text-blue-300">
            <Calculator className="h-12 w-12 mb-4 text-blue-500 dark:text-blue-400/50" />
            <h3 className="text-lg font-semibold mb-2">
              No general accounts found
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400/70 text-center">
              {searchQuery
                ? "Try adjusting your search terms."
                : "Get started by creating your first general account."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-800/30"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Smart Pagination */}
      {filteredAndSortedAccounts.length > 0 && (
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Bulk Actions Bar - rendered via portal to document body */}
      {createPortal(
        <AnimatePresence>
          {selectedAccounts.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-lg shadow-[0_8px_32px_rgba(59,130,246,0.7)] rounded-2xl border border-blue-400/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2 ring-blue-400/40">
                <div className="flex items-center text-blue-200 font-medium">
                  <div className="bg-blue-500/30 p-1.5 rounded-xl mr-3 flex-shrink-0">
                    <Calculator className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-sm sm:text-base text-center sm:text-left">
                    <span className="font-bold text-blue-100">
                      {selectedAccounts.length}
                    </span>{" "}
                    general account{selectedAccounts.length !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                    disabled
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Create General Account Wizard */}
      <CreateGeneralAccountWizard
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsCreateDialogOpen(false);
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Edit General Account
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update general account information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditAccount)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter account code"
                        {...field}
                        disabled
                        className="bg-blue-950/30 border-blue-800/30 text-gray-400 cursor-not-allowed opacity-50"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-blue-400 text-xs mt-1">
                      Code cannot be edited
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter account description"
                        {...field}
                        className="bg-blue-950/30 border-blue-800/30 text-blue-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-400" />
              General Account Details
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Complete information about the selected general account
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-300">
                    Code
                  </Label>
                  <div className="bg-blue-950/30 border border-blue-800/30 rounded-md p-3">
                    <span className="font-mono text-blue-300">
                      {selectedAccount.code}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-300">
                    Description
                  </Label>
                  <div className="bg-blue-950/30 border border-blue-800/30 rounded-md p-3">
                    <span className="text-blue-100">
                      {selectedAccount.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Element Types Association */}
              {selectedAccount.lignesCount > 0 && (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-amber-400" />
                    <Label className="text-sm font-medium text-amber-300">
                      Element Types Association
                    </Label>
                  </div>
                  <div className="text-sm text-amber-200">
                    This account is associated with{" "}
                    <span className="font-bold text-amber-100">
                      {selectedAccount.lignesCount}
                    </span>{" "}
                    element type{selectedAccount.lignesCount !== 1 ? "s" : ""}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-200 font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Metadata
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-400">Created At</Label>
                    <div className="text-blue-200">
                      {new Date(selectedAccount.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-400">Updated At</Label>
                    <div className="text-blue-200">
                      {new Date(selectedAccount.updatedAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-100">
              Delete General Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete general account "
              {selectedAccount?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedAccount && selectedAccount.lignesCount > 0 && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <p className="text-red-400 flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4" />
                This account is used in {selectedAccount.lignesCount} element
                type{selectedAccount.lignesCount !== 1 ? "s" : ""} and cannot be
                deleted.
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={selectedAccount?.lignesCount > 0}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-blue-100">
              Delete General Accounts
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedAccounts.length} general
              accounts? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GeneralAccountsManagement;
