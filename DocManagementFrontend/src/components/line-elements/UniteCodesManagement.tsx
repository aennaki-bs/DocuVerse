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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Hash,
  Package,
  Calendar,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Info,
  ArrowUp,
  ArrowDown,
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
  UniteCode,
  LignesElementType,
  CreateUniteCodeRequest,
  UpdateUniteCodeRequest,
} from "@/models/lineElements";

// Form validation schema
const uniteCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be 255 characters or less"),
});

type UniteCodeFormData = z.infer<typeof uniteCodeSchema>;

// Search field options
const UNITE_CODE_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Code" },
  { id: "description", label: "Description" },
];

interface UniteCodesManagementProps {
  searchTerm: string;
  elementType?: LignesElementType;
}

const UniteCodesManagement = ({
  searchTerm,
  elementType,
}: UniteCodesManagementProps) => {
  const [uniteCodes, setUniteCodes] = useState<UniteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof UniteCode>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUniteCodes, setSelectedUniteCodes] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedUniteCode, setSelectedUniteCode] = useState<UniteCode | null>(
    null
  );

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Code validation states
  const [codeValidation, setCodeValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isValidating: false,
    isValid: null,
    message: "",
  });

  // Edit code validation states
  const [editCodeValidation, setEditCodeValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isValidating: false,
    isValid: null,
    message: "",
  });

  const form = useForm<UniteCodeFormData>({
    resolver: zodResolver(uniteCodeSchema),
    defaultValues: {
      code: "",
      description: "",
    },
  });

  const editForm = useForm<UniteCodeFormData>({
    resolver: zodResolver(uniteCodeSchema),
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
      const data = await lineElementsService.uniteCodes.getAll();
      setUniteCodes(data);
    } catch (error) {
      console.error("Failed to fetch unit codes:", error);
      toast.error("Failed to load unit codes data");
    } finally {
      setLoading(false);
    }
  };

  // Code validation function
  const validateCodeUniqueness = async (code: string) => {
    if (!code || code.length < 1) {
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      return;
    }

    setCodeValidation((prev) => ({
      ...prev,
      isValidating: true,
    }));

    try {
      const isValid = await lineElementsService.uniteCodes.validateCode(code);
      setCodeValidation({
        isValidating: false,
        isValid,
        message: isValid ? "Code is available" : "Code already exists",
      });
    } catch (error) {
      console.error("Error validating code:", error);
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: "Error validating code",
      });
    }
  };

  // Edit code validation function
  const validateEditCodeUniqueness = async (
    code: string,
    excludeCode?: string
  ) => {
    if (!code || code.length < 1) {
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      return;
    }

    // If code hasn't changed, mark as valid
    if (excludeCode && code.toUpperCase() === excludeCode.toUpperCase()) {
      setEditCodeValidation({
        isValidating: false,
        isValid: true,
        message: "Current code",
      });
      return;
    }

    setEditCodeValidation((prev) => ({
      ...prev,
      isValidating: true,
    }));

    try {
      const isValid = await lineElementsService.uniteCodes.validateCode(
        code,
        excludeCode
      );
      setEditCodeValidation({
        isValidating: false,
        isValid,
        message: isValid ? "Code is available" : "Code already exists",
      });
    } catch (error) {
      console.error("Error validating edit code:", error);
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: "Error validating code",
      });
    }
  };

  // Debounced code validation
  useEffect(() => {
    const code = form.watch("code");
    if (!code) {
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateCodeUniqueness(code);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch("code")]);

  // Debounced edit code validation
  useEffect(() => {
    const code = editForm.watch("code");
    if (!code || !selectedUniteCode) {
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateEditCodeUniqueness(code, selectedUniteCode.code);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editForm.watch("code"), selectedUniteCode]);

  const filteredAndSortedUniteCodes = useMemo(() => {
    let filtered = uniteCodes.filter((uniteCode) => {
      // Search filter
      const searchValue = searchQuery.toLowerCase();
      let matchesSearch = true;

      if (searchValue) {
        switch (searchField) {
          case "code":
            matchesSearch = uniteCode.code.toLowerCase().includes(searchValue);
            break;
          case "description":
            matchesSearch = uniteCode.description
              .toLowerCase()
              .includes(searchValue);
            break;
          default: // 'all'
            matchesSearch =
              uniteCode.code.toLowerCase().includes(searchValue) ||
              uniteCode.description.toLowerCase().includes(searchValue);
        }
      }

      // Global search term from parent
      if (searchTerm && !searchValue) {
        matchesSearch =
          uniteCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          uniteCode.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
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
    uniteCodes,
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
    paginatedData: paginatedUniteCodes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredAndSortedUniteCodes,
    initialPageSize: 25,
  });

  const handleSort = (field: keyof UniteCode) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof UniteCode) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof UniteCode) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  const handleSelectAll = () => {
    const currentPageCodes = paginatedUniteCodes.map((uc) => uc.code);
    const selectedOnCurrentPage = selectedUniteCodes.filter((code) =>
      currentPageCodes.includes(code)
    );

    if (selectedOnCurrentPage.length === currentPageCodes.length) {
      // Deselect all on current page
      setSelectedUniteCodes((prev) =>
        prev.filter((code) => !currentPageCodes.includes(code))
      );
    } else {
      // Select all on current page
      setSelectedUniteCodes((prev) => [
        ...prev.filter((code) => !currentPageCodes.includes(code)),
        ...currentPageCodes,
      ]);
    }
  };

  const handleSelectUniteCode = (code: string) => {
    setSelectedUniteCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCreateUniteCode = async (data: UniteCodeFormData) => {
    try {
      // Check if code validation is still pending or failed
      if (codeValidation.isValidating) {
        toast.error("Please wait for code validation to complete");
        return;
      }

      if (codeValidation.isValid === false) {
        toast.error("Please choose a unique code");
        return;
      }

      const createRequest: CreateUniteCodeRequest = {
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
      };

      await lineElementsService.uniteCodes.create(createRequest);
      toast.success("Unit code created successfully");
      setIsCreateDialogOpen(false);
      form.reset();
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create unit code:", error);
      toast.error("Failed to create unit code");
    }
  };

  const handleEditUniteCode = async (data: UniteCodeFormData) => {
    if (!selectedUniteCode) return;

    try {
      // Check if code validation is still pending or failed (only if code changed)
      const codeChanged =
        data.code.toUpperCase() !== selectedUniteCode.code.toUpperCase();
      if (codeChanged) {
        if (editCodeValidation.isValidating) {
          toast.error("Please wait for code validation to complete");
          return;
        }

        if (editCodeValidation.isValid === false) {
          toast.error("Please choose a unique code");
          return;
        }
      }

      const updateRequest: UpdateUniteCodeRequest = {
        code: codeChanged ? data.code.trim().toUpperCase() : undefined,
        description: data.description.trim(),
      };

      await lineElementsService.uniteCodes.update(
        selectedUniteCode.code,
        updateRequest
      );
      toast.success("Unit code updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUniteCode(null);
      editForm.reset();
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update unit code:", error);
      toast.error("Failed to update unit code");
    }
  };

  const handleDeleteUniteCode = async () => {
    if (!selectedUniteCode) return;

    try {
      await lineElementsService.uniteCodes.delete(selectedUniteCode.code);
      toast.success("Unit code deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUniteCode(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete unit code:", error);
      toast.error("Failed to delete unit code");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedUniteCodes.map((code) =>
          lineElementsService.uniteCodes.delete(code)
        )
      );
      toast.success(
        `${selectedUniteCodes.length} unit codes deleted successfully`
      );
      setSelectedUniteCodes([]);
      setIsBulkDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to delete unit codes:", error);
      toast.error("Failed to delete unit codes");
    }
  };

  const openEditDialog = (uniteCode: UniteCode) => {
    setSelectedUniteCode(uniteCode);
    editForm.reset({
      code: uniteCode.code,
      description: uniteCode.description,
    });
    setEditCodeValidation({
      isValidating: false,
      isValid: null,
      message: "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (uniteCode: UniteCode) => {
    setSelectedUniteCode(uniteCode);
    setIsDeleteDialogOpen(true);
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
            Loading unit codes...
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
                {UNITE_CODE_SEARCH_FIELDS.find((opt) => opt.id === searchField)
                  ?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40">
              {UNITE_CODE_SEARCH_FIELDS.map((opt) => (
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
              placeholder="Search unit codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm placeholder:text-blue-500 dark:placeholder:text-blue-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" disabled>
                <Plus className="h-4 w-4" />
                Create Unit Code
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 overflow-hidden dark:bg-gradient-to-b dark:from-[#1a2c6b]/50 dark:to-[#0a1033]/50 shadow-lg">
        {filteredAndSortedUniteCodes.length > 0 ? (
          <>
            {/* Fixed Header - Never Scrolls */}
            <div className="min-w-[800px] border-b border-blue-200 dark:border-blue-900/30">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-blue-50 dark:bg-gradient-to-r dark:from-[#1a2c6b] dark:to-[#0a1033]">
                  <TableRow className="border-blue-200 dark:border-blue-900/30 hover:bg-transparent">
                    <TableHead className="w-[50px]">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={
                            paginatedUniteCodes.length > 0 &&
                            paginatedUniteCodes.every((uniteCode) =>
                              selectedUniteCodes.includes(uniteCode.code)
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
                      className={`${headerClass("description")} w-[400px]`}
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center">
                        Description {renderSortIcon("description")}
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px] text-blue-800 dark:text-blue-200 font-medium text-right pr-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
              <div className="min-w-[800px]">
                <Table className="table-fixed w-full">
                  <TableBody>
                    {paginatedUniteCodes.map((uniteCode, rowIndex) => (
                      <TableRow
                        key={uniteCode.code}
                        className={`border-blue-200 dark:border-blue-900/30 transition-all duration-200 group cursor-default ${
                          rowIndex % 2 === 0
                            ? "bg-blue-50 dark:bg-blue-950/10"
                            : "bg-white dark:bg-transparent"
                        } ${
                          selectedUniteCodes.includes(uniteCode.code)
                            ? "bg-blue-200 dark:bg-blue-900/40 border-l-4 border-l-blue-500"
                            : "hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        <TableCell className="w-[50px]">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selectedUniteCodes.includes(
                                uniteCode.code
                              )}
                              onCheckedChange={() =>
                                handleSelectUniteCode(uniteCode.code)
                              }
                              aria-label={`Select ${uniteCode.code}`}
                              className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="w-[150px] font-mono text-blue-900 dark:text-blue-300 font-semibold">
                          {uniteCode.code}
                        </TableCell>
                        <TableCell className="w-[400px] text-blue-800 dark:text-blue-200">
                          <div className="truncate">
                            {uniteCode.description}
                          </div>
                        </TableCell>
                        <TableCell className="w-[200px] text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(uniteCode)}
                              className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30"
                              title="Edit unit code"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="h-8 w-8 p-0 opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-400"
                                  title="Delete functionality disabled"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border-red-300 dark:border-red-500/30 text-blue-900 dark:text-white shadow-[0_0_25px_rgba(239,68,68,0.2)] rounded-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl text-red-700 dark:text-red-300">
                                    Delete Unit Code
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-blue-700 dark:text-blue-300">
                                    Are you sure you want to delete unit code "
                                    {uniteCode.code}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                {uniteCode.itemsCount > 0 && (
                                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-300 dark:border-blue-900/30">
                                    <p className="text-red-700 dark:text-red-400 flex items-center">
                                      <AlertTriangle className="mr-1 h-4 w-4" />
                                      This unit code is used in{" "}
                                      {uniteCode.itemsCount} item
                                      {uniteCode.itemsCount !== 1 ? "s" : ""}{" "}
                                      and cannot be deleted.
                                    </p>
                                  </div>
                                )}
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white dark:bg-transparent border-blue-300 dark:border-blue-800/40 text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/20">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => openDeleteDialog(uniteCode)}
                                    disabled={uniteCode.itemsCount > 0}
                                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
            <Hash className="h-12 w-12 mb-4 text-blue-500 dark:text-blue-400/50" />
            <h3 className="text-lg font-semibold mb-2">No unit codes found</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400/70 text-center">
              {searchQuery
                ? "Try adjusting your search terms."
                : "Get started by creating your first unit code."}
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
      {filteredAndSortedUniteCodes.length > 0 && (
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
          {selectedUniteCodes.length > 0 && (
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
                    <Hash className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-sm sm:text-base text-center sm:text-left">
                    <span className="font-bold text-blue-100">
                      {selectedUniteCodes.length}
                    </span>{" "}
                    unit code{selectedUniteCodes.length !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsBulkDeleteDialogOpen(true)}
                    title="Delete functionality disabled"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
                {selectedUniteCodes.some((code) => {
                  const uniteCode = filteredAndSortedUniteCodes.find(
                    (uc) => uc.code === code
                  );
                  return uniteCode && uniteCode.itemsCount > 0;
                }) && (
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Some unit codes are used by items</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            form.reset();
            setCodeValidation({
              isValidating: false,
              isValid: null,
              message: "",
            });
          }
        }}
      >
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Create Unit Code
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Add a new measurement unit to the system
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateUniteCode)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter unit code (e.g., KG, M, L)"
                          {...field}
                          className="bg-blue-950/30 border-blue-800/30 text-blue-100 pr-10"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {codeValidation.isValidating && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          )}
                          {codeValidation.isValid === true && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {codeValidation.isValid === false && (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {codeValidation.message && (
                      <p
                        className={`text-xs mt-1 ${
                          codeValidation.isValid === true
                            ? "text-green-400"
                            : codeValidation.isValid === false
                            ? "text-red-400"
                            : "text-blue-300"
                        }`}
                      >
                        {codeValidation.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter unit description"
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
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    codeValidation.isValidating ||
                    codeValidation.isValid === false
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {codeValidation.isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Create Unit Code"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedUniteCode(null);
            editForm.reset();
            setEditCodeValidation({
              isValidating: false,
              isValid: null,
              message: "",
            });
          }
        }}
      >
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Edit Unit Code
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the unit code information
            </DialogDescription>
          </DialogHeader>
          {selectedUniteCode && selectedUniteCode.itemsCount > 0 && (
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm flex items-center">
                <Info className="mr-2 h-4 w-4" />
                <strong>Info:</strong> This unit code is used by{" "}
                {selectedUniteCode.itemsCount} items. Changing the code will
                automatically update all associated items.
              </p>
            </div>
          )}
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditUniteCode)}
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
                        placeholder="Enter unit code (e.g., KG, M, L)"
                        {...field}
                        className="bg-blue-950/30 border-blue-800/30 text-blue-100 opacity-50 cursor-not-allowed"
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs mt-1 text-blue-400">
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
                        placeholder="Enter unit description"
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
                <Button
                  type="submit"
                  disabled={
                    editCodeValidation.isValidating ||
                    editCodeValidation.isValid === false
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editCodeValidation.isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Update Unit Code"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
              Delete Unit Code
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete unit code "
              {selectedUniteCode?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedUniteCode && selectedUniteCode.itemsCount > 0 && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <p className="text-red-400 flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4" />
                This unit code is used by {selectedUniteCode.itemsCount} items
                and cannot be deleted.
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUniteCode}
              disabled={selectedUniteCode?.itemsCount > 0}
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
              Delete Unit Codes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedUniteCodes.length} unit
              codes? This action cannot be undone.
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

export default UniteCodesManagement;
