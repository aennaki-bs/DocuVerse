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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Database,
  Tag,
  Calendar,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  Package,
  Calculator,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  LignesElementType,
  Item,
  GeneralAccounts,
  CreateLignesElementTypeRequest,
  UpdateLignesElementTypeRequest,
} from "@/models/lineElements";
import CreateElementTypeWizard from "./CreateElementTypeWizard";

// Form validation schema
const elementTypeSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less"),
  typeElement: z.string().min(1, "Type element is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be 255 characters or less"),
  tableName: z.string().min(1, "Table name is required"),
  itemCode: z.string().optional(),
  accountCode: z.string().optional(),
});

type ElementTypeFormData = z.infer<typeof elementTypeSchema>;

// Search field options
const ELEMENT_TYPE_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Code" },
  { id: "typeElement", label: "Type Element" },
  { id: "description", label: "Description" },
  { id: "tableName", label: "Table Name" },
];

interface LineElementTypeManagementProps {
  searchTerm: string;
}

const LineElementTypeManagement = ({
  searchTerm,
}: LineElementTypeManagementProps) => {
  const [elementTypes, setElementTypes] = useState<LignesElementType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof LignesElementType>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedElementTypes, setSelectedElementTypes] = useState<number[]>(
    []
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [selectedElementType, setSelectedElementType] =
    useState<LignesElementType | null>(null);
  const [elementTypesInUse, setElementTypesInUse] = useState<Set<number>>(
    new Set()
  );

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [typeFilter, setTypeFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filtered and sorted data calculation
  const filteredAndSortedElementTypes = useMemo(() => {
    let filtered = elementTypes.filter((elementType) => {
      // Search filter
      const searchValue = searchQuery.toLowerCase();
      let matchesSearch = true;

      if (searchValue) {
        switch (searchField) {
          case "code":
            matchesSearch = elementType.code
              .toLowerCase()
              .includes(searchValue);
            break;
          case "typeElement":
            matchesSearch = elementType.typeElement
              .toLowerCase()
              .includes(searchValue);
            break;
          case "description":
            matchesSearch = elementType.description
              .toLowerCase()
              .includes(searchValue);
            break;
          case "tableName":
            matchesSearch = elementType.tableName
              .toLowerCase()
              .includes(searchValue);
            break;
          default: // 'all'
            matchesSearch =
              elementType.code.toLowerCase().includes(searchValue) ||
              elementType.typeElement.toLowerCase().includes(searchValue) ||
              elementType.description.toLowerCase().includes(searchValue) ||
              elementType.tableName.toLowerCase().includes(searchValue);
        }
      }

      // Global search term from parent
      if (searchTerm && !searchValue) {
        matchesSearch =
          elementType.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          elementType.typeElement
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          elementType.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          elementType.tableName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
      }

      // Type filter
      const matchesType =
        typeFilter === "any" || elementType.typeElement === typeFilter;

      return matchesSearch && matchesType;
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
        case "typeElement":
          aValue = a.typeElement;
          bValue = b.typeElement;
          break;
        case "description":
          aValue = a.description;
          bValue = b.description;
          break;
        case "tableName":
          aValue = a.tableName;
          bValue = b.tableName;
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
    elementTypes,
    searchQuery,
    searchField,
    searchTerm,
    typeFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedElementTypes,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredAndSortedElementTypes,
    initialPageSize: 10,
  });

  // Form state
  const editForm = useForm<ElementTypeFormData>({
    resolver: zodResolver(elementTypeSchema),
    defaultValues: {
      code: "",
      typeElement: "",
      description: "",
      tableName: "",
      itemCode: "",
      accountCode: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [elementTypesData, itemsData, generalAccountsData] =
        await Promise.all([
          lineElementsService.elementTypes.getAll(),
          lineElementsService.items.getAll(),
          lineElementsService.generalAccounts.getAll(),
        ]);
      setElementTypes(elementTypesData);
      setItems(itemsData);
      setGeneralAccounts(generalAccountsData);

      // Check which element types are in use
      const inUseSet = new Set<number>();
      await Promise.all(
        elementTypesData.map(async (elementType) => {
          try {
            const isInUse = await lineElementsService.elementTypes.isInUse(
              elementType.id
            );
            if (isInUse) {
              inUseSet.add(elementType.id);
            }
          } catch (error) {
            console.error(
              `Failed to check if element type ${elementType.id} is in use:`,
              error
            );
          }
        })
      );
      setElementTypesInUse(inUseSet);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load element types data");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof LignesElementType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof LignesElementType) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-400" />
    );
  };

  const headerClass = (field: keyof LignesElementType) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  const handleSelectAll = () => {
    if (
      selectedElementTypes.length === paginatedElementTypes.length &&
      paginatedElementTypes.length > 0
    ) {
      // Deselect all on current page
      const currentPageIds = paginatedElementTypes.map(
        (elementType) => elementType.id
      );
      setSelectedElementTypes(
        selectedElementTypes.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      // Select all on current page
      const newSelected = [...selectedElementTypes];
      paginatedElementTypes.forEach((elementType) => {
        if (!selectedElementTypes.includes(elementType.id)) {
          newSelected.push(elementType.id);
        }
      });
      setSelectedElementTypes(newSelected);
    }
  };

  const handleSelectElementType = (id: number) => {
    setSelectedElementTypes((prev) =>
      prev.includes(id) ? prev.filter((etId) => etId !== id) : [...prev, id]
    );
  };

  const handleEditElementType = async (data: ElementTypeFormData) => {
    if (!selectedElementType) return;

    try {
      const updateData: UpdateLignesElementTypeRequest = {
        code: data.code,
        typeElement: data.typeElement,
        description: data.description,
        tableName: data.tableName,
        itemCode: data.itemCode ? data.itemCode : undefined,
        accountCode: data.accountCode ? data.accountCode : undefined,
      };

      await lineElementsService.elementTypes.update(
        selectedElementType.id,
        updateData
      );
      toast.success("Element type updated successfully");
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedElementType(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update element type:", error);
      toast.error("Failed to update element type");
    }
  };

  const handleDeleteElementType = async () => {
    if (!selectedElementType) return;

    try {
      await lineElementsService.elementTypes.delete(selectedElementType.id);
      toast.success("Element type deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedElementType(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete element type:", error);
      toast.error("Failed to delete element type");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedElementTypes.map((id) =>
          lineElementsService.elementTypes.delete(id)
        )
      );
      toast.success(
        `${selectedElementTypes.length} element types deleted successfully`
      );
      setIsBulkDeleteDialogOpen(false);
      setSelectedElementTypes([]);
      fetchData();
    } catch (error) {
      console.error("Failed to delete element types:", error);
      toast.error("Failed to delete element types");
    }
  };

  const openEditDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    editForm.reset({
      code: elementType.code,
      typeElement: elementType.typeElement,
      description: elementType.description,
      tableName: elementType.tableName,
      itemCode: elementType.item?.code || "",
      accountCode: elementType.generalAccount?.code || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    setIsViewDialogOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setTypeFilter("any");
  };

  const getTypeIcon = (typeElement: string) => {
    const type = typeElement.toLowerCase();
    if (type.includes("account") || type.includes("budget"))
      return <Calculator className="h-4 w-4" />;
    if (type.includes("item") || type.includes("product"))
      return <Package className="h-4 w-4" />;
    if (type.includes("database") || type.includes("data"))
      return <Database className="h-4 w-4" />;
    return <Tag className="h-4 w-4" />;
  };

  const getTypeBadgeColor = (typeElement: string) => {
    switch (typeElement?.toLowerCase()) {
      case "item":
        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";
      case "generalaccounts":
        return "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-500/30";
      case "unitecode":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30";
      default:
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30";
    }
  };

  // Get unique types for filter dropdown
  const availableTypes = useMemo(() => {
    const types = [...new Set(elementTypes.map((et) => et.typeElement))];
    return types.sort();
  }, [elementTypes]);

  // BulkActionsBar component
  const BulkActionsBar = () => {
    if (selectedElementTypes.length === 0) return null;

    return createPortal(
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1a2c6b] border border-blue-200 dark:border-blue-500/50 rounded-xl shadow-2xl p-4 min-w-[400px]"
      >
        <div className="flex items-center text-blue-800 dark:text-blue-200 font-medium">
          <div className="flex items-center gap-2 flex-1">
            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            <span>
              <span className="font-bold text-blue-900 dark:text-blue-100">
                {selectedElementTypes.length}
              </span>{" "}
              element types selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedElementTypes([])}
              className="bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800/60 hover:border-blue-400 dark:hover:border-blue-400/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[80px] font-medium"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Modern Header */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 overflow-hidden bg-white dark:bg-[#0a1033] shadow-xl">
          <div className="p-6 border-b border-blue-200 dark:border-blue-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-white tracking-wide flex items-center gap-3">
                <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Element Types
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium">
                {filteredAndSortedElementTypes.length} of {elementTypes.length}{" "}
                element types{" "}
                {searchQuery || typeFilter !== "any" ? "found" : "total"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsCreateWizardOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-11 px-6 shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Element Type
              </Button>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Input
                  placeholder="Search element types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/50 text-blue-900 dark:text-white placeholder:text-blue-500 dark:placeholder:text-blue-400/60 focus:border-blue-600 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-40 bg-white dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/50 text-blue-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1a2c6b] border-blue-300 dark:border-blue-700/50 text-blue-900 dark:text-white">
                    {ELEMENT_TYPE_SEARCH_FIELDS.map((field) => (
                      <SelectItem
                        key={field.id}
                        value={field.id}
                        className="text-blue-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-800/50"
                      >
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/50 text-blue-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-800/50"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {typeFilter !== "any" && (
                        <Badge className="ml-2 bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-200 text-xs">
                          1
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 bg-white dark:bg-[#1a2c6b] border-blue-300 dark:border-blue-700/50 text-blue-900 dark:text-white"
                    align="end"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Type Element
                        </Label>
                        <Select
                          value={typeFilter}
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="mt-1 bg-white dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/50 text-blue-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-[#1a2c6b] border-blue-300 dark:border-blue-700/50 text-blue-900 dark:text-white">
                            <SelectItem
                              value="any"
                              className="text-blue-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-800/50"
                            >
                              Any Type
                            </SelectItem>
                            {availableTypes.map((type) => (
                              <SelectItem
                                key={type}
                                value={type}
                                className="text-blue-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-800/50"
                              >
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                          className="bg-white dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                        >
                          Clear All
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setFilterOpen(false)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear filters shortcut */}
            {(searchQuery || typeFilter !== "any") && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Active filters:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="p-0">
            {loading ? (
              <div className="text-center py-12 px-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
                <p className="text-blue-700 dark:text-blue-300 text-lg font-medium">
                  Loading element types...
                </p>
              </div>
            ) : filteredAndSortedElementTypes.length === 0 ? (
              <div className="text-center py-12 px-6 border border-dashed border-blue-300 dark:border-blue-900/50 rounded-xl bg-blue-50 dark:bg-gradient-to-b dark:from-[#182052]/50 dark:to-[#0f1642]/50 backdrop-blur-sm mx-6 my-6">
                <Tag className="h-20 w-20 mx-auto text-blue-400 dark:text-blue-800/50 mb-6" />
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-3">
                  {searchQuery || typeFilter !== "any"
                    ? "No element types found"
                    : "No element types yet"}
                </h3>
                <p className="text-blue-600 dark:text-blue-400/70 max-w-md mx-auto mb-8 text-lg leading-relaxed">
                  {searchQuery || typeFilter !== "any"
                    ? "No element types match your current filters. Try adjusting your search criteria."
                    : "Get started by creating your first element type to organize your document line elements."}
                </p>
                {!(searchQuery || typeFilter !== "any") && (
                  <Button
                    onClick={() => setIsCreateWizardOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="mr-3 h-5 w-5" />
                    Add Element Type
                  </Button>
                )}
              </div>
            ) : (
              <div>
                {/* Fixed Header - Never Scrolls */}
                <div className="min-w-[1200px] border-b border-blue-200 dark:border-blue-900/30">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-blue-100 dark:bg-[#1a2c6b]">
                      <TableRow className="border-blue-200 dark:border-blue-900/30 hover:bg-transparent">
                        <TableHead className="w-[50px] text-blue-800 dark:text-blue-300 font-semibold py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={
                                paginatedElementTypes.length > 0 &&
                                paginatedElementTypes.every((elementType) =>
                                  selectedElementTypes.includes(elementType.id)
                                )
                              }
                              onCheckedChange={handleSelectAll}
                              className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                            />
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("code")}
                          className={`w-[150px] text-blue-800 dark:text-blue-300 font-semibold py-4 px-6 text-left cursor-pointer hover:text-blue-900 dark:hover:text-blue-200 ${headerClass(
                            "code"
                          )}`}
                        >
                          <div className="flex items-center">
                            Code
                            {renderSortIcon("code")}
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("typeElement")}
                          className={`w-[200px] text-blue-800 dark:text-blue-300 font-semibold py-4 px-6 text-left cursor-pointer hover:text-blue-900 dark:hover:text-blue-200 ${headerClass(
                            "typeElement"
                          )}`}
                        >
                          <div className="flex items-center">
                            Type Element
                            {renderSortIcon("typeElement")}
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("description")}
                          className={`w-[300px] text-blue-800 dark:text-blue-300 font-semibold py-4 px-6 text-left cursor-pointer hover:text-blue-900 dark:hover:text-blue-200 ${headerClass(
                            "description"
                          )}`}
                        >
                          <div className="flex items-center">
                            Description
                            {renderSortIcon("description")}
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("tableName")}
                          className={`w-[200px] text-blue-800 dark:text-blue-300 font-semibold py-4 px-6 text-left cursor-pointer hover:text-blue-900 dark:hover:text-blue-200 ${headerClass(
                            "tableName"
                          )}`}
                        >
                          <div className="flex items-center">
                            Table Name
                            {renderSortIcon("tableName")}
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-blue-800 dark:text-blue-300 font-semibold py-4 px-6 text-center">
                          <span className="text-sm font-medium">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>

                {/* Scrollable Body - Only Content Scrolls */}
                <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
                  <div className="min-w-[1200px]">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {paginatedElementTypes.map((elementType, rowIndex) => {
                          const isInUse = elementTypesInUse.has(elementType.id);
                          const shouldDisable = isInUse;

                          return (
                            <TableRow
                              key={elementType.id}
                              className={`border-blue-200 dark:border-blue-900/30 transition-all duration-200 group cursor-default ${
                                rowIndex % 2 === 0
                                  ? "bg-blue-50 dark:bg-blue-950/10"
                                  : "bg-white dark:bg-transparent"
                              } ${
                                selectedElementTypes.includes(elementType.id)
                                  ? "bg-blue-200 dark:bg-blue-900/40 border-l-4 border-l-blue-500"
                                  : "hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              }`}
                            >
                              <TableCell className="w-[50px] py-4 px-6 text-center align-middle">
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={selectedElementTypes.includes(
                                      elementType.id
                                    )}
                                    onCheckedChange={() =>
                                      handleSelectElementType(elementType.id)
                                    }
                                    className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="w-[150px] py-4 px-6 align-middle">
                                <div className="font-mono text-blue-900 dark:text-blue-300 font-semibold text-base">
                                  {elementType.code}
                                </div>
                              </TableCell>
                              <TableCell className="w-[200px] py-4 px-6 align-middle">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(elementType.typeElement)}
                                  <Badge
                                    className={getTypeBadgeColor(
                                      elementType.typeElement
                                    )}
                                  >
                                    {elementType.typeElement}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="w-[300px] py-4 px-6 align-middle">
                                <div className="text-blue-800 dark:text-blue-100 font-medium">
                                  <div className="truncate max-w-[280px]">
                                    {elementType.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="w-[200px] py-4 px-6 align-middle">
                                <div className="font-mono text-blue-700 dark:text-blue-200 text-sm">
                                  {elementType.tableName}
                                </div>
                              </TableCell>
                              <TableCell className="w-[120px] py-4 px-6 text-center align-middle">
                                <div className="flex justify-center items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openViewDialog(elementType)}
                                    className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-green-600 dark:hover:text-blue-300 hover:bg-green-100 dark:hover:bg-blue-900/30 transition-all duration-200 rounded-md"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(elementType)}
                                    disabled={shouldDisable}
                                    className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={
                                      shouldDisable
                                        ? "Cannot edit: Element type is used by lines"
                                        : "Edit"
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog
                                    open={
                                      isDeleteDialogOpen &&
                                      selectedElementType?.id === elementType.id
                                    }
                                    onOpenChange={(open) => {
                                      if (!open) {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedElementType(null);
                                      }
                                    }}
                                  >
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          openDeleteDialog(elementType)
                                        }
                                        disabled={shouldDisable}
                                        className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          shouldDisable
                                            ? "Cannot delete: Element type is used by lines"
                                            : "Delete"
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border-red-300 dark:border-red-500/30 text-blue-900 dark:text-white shadow-[0_0_25px_rgba(239,68,68,0.2)] rounded-xl">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl text-red-700 dark:text-red-300">
                                          Delete Element Type
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-blue-700 dark:text-blue-300">
                                          Are you sure you want to delete the
                                          element type "{elementType.code}"?
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/20 hover:text-blue-800 dark:hover:text-blue-200">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={handleDeleteElementType}
                                          className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-200 border border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-400/50 transition-all duration-200"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>

                {/* Smart Pagination */}
                <div className="pt-4 pb-2 px-6 border-t border-blue-200 dark:border-blue-900/20">
                  <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-100">
                Edit Element Type
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Update the element type details below.
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditElementType)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-blue-950/50 border-blue-800/50 text-white focus:border-blue-600 focus:ring-blue-600/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="typeElement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">
                          Type Element
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-blue-950/50 border-blue-800/50 text-white focus:border-blue-600 focus:ring-blue-600/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-blue-950/50 border-blue-800/50 text-white focus:border-blue-600 focus:ring-blue-600/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="tableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">
                        Table Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-blue-950/50 border-blue-800/50 text-white focus:border-blue-600 focus:ring-blue-600/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">
                          Item Code (Optional)
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-blue-950/50 border-blue-800/50 text-white">
                              <SelectValue placeholder="Select item..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#1a2c6b] border-blue-700/50 text-white">
                            <SelectItem
                              key="none-item"
                              value=""
                              className="text-white hover:bg-blue-800/50"
                            >
                              None
                            </SelectItem>
                            {items.map((item) => (
                              <SelectItem
                                key={`item-${item.code}`}
                                value={item.code}
                                className="text-white hover:bg-blue-800/50"
                              >
                                {item.code} - {item.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="accountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">
                          Account Code (Optional)
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-blue-950/50 border-blue-800/50 text-white">
                              <SelectValue placeholder="Select account..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#1a2c6b] border-blue-700/50 text-white">
                            <SelectItem
                              key="none-account"
                              value=""
                              className="text-white hover:bg-blue-800/50"
                            >
                              None
                            </SelectItem>
                            {generalAccounts.map((account) => (
                              <SelectItem
                                key={`account-${account.code}`}
                                value={account.code}
                                className="text-white hover:bg-blue-800/50"
                              >
                                {account.code} - {account.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-blue-100">
                <Package className="h-5 w-5 text-blue-400" />
                Element Type Details
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Complete information about the selected element type
              </DialogDescription>
            </DialogHeader>

            {selectedElementType && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-300">
                      Code
                    </Label>
                    <div className="bg-blue-950/50 border border-blue-800/50 rounded-md p-3">
                      <span className="font-mono text-blue-200">
                        {selectedElementType.code}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-300">
                      Type Element
                    </Label>
                    <div className="bg-blue-950/50 border border-blue-800/50 rounded-md p-3 flex items-center gap-2">
                      {getTypeIcon(selectedElementType.typeElement)}
                      <Badge
                        className={getTypeBadgeColor(
                          selectedElementType.typeElement
                        )}
                      >
                        {selectedElementType.typeElement}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-300">
                    Description
                  </Label>
                  <div className="bg-blue-950/50 border border-blue-800/50 rounded-md p-3">
                    <span className="text-blue-100">
                      {selectedElementType.description}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-300">
                    Table Name
                  </Label>
                  <div className="bg-blue-950/50 border border-blue-800/50 rounded-md p-3">
                    <span className="font-mono text-blue-200">
                      {selectedElementType.tableName}
                    </span>
                  </div>
                </div>

                {/* Associated Item or Account */}
                {(selectedElementType.item ||
                  selectedElementType.generalAccount) && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-200 font-medium mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Associated{" "}
                      {selectedElementType.item ? "Item" : "General Account"}
                    </h4>

                    {selectedElementType.item && (
                      <div className="space-y-4">
                        {/* Item Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-400">
                              Item Code
                            </Label>
                            <div className="bg-blue-950/30 border border-blue-500/20 rounded-md p-2">
                              <span className="text-sm font-mono font-medium text-blue-300">
                                {selectedElementType.item.code}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-400">
                              Description
                            </Label>
                            <div className="bg-blue-950/30 border border-blue-500/20 rounded-md p-2">
                              <span className="text-sm font-medium text-blue-300">
                                {selectedElementType.item.description}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Unit Info */}
                        {selectedElementType.item.uniteCodeNavigation && (
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-400">
                              Unit of Measure
                            </Label>
                            <div className="bg-purple-950/30 border border-purple-500/20 rounded-md p-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-medium text-purple-300">
                                  {
                                    selectedElementType.item.uniteCodeNavigation
                                      .code
                                  }
                                </span>
                                <span className="text-xs text-purple-400">
                                  -
                                </span>
                                <span className="text-sm text-purple-300">
                                  {
                                    selectedElementType.item.uniteCodeNavigation
                                      .description
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Item Status & Metadata */}
                        <div className="border-t border-blue-500/20 pt-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            <div className="space-y-1">
                              <Label className="text-blue-400">
                                Element Types Count
                              </Label>
                              <div className="text-blue-300 font-mono">
                                {selectedElementType.item.elementTypesCount}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-blue-400">Created</Label>
                              <div className="text-blue-200">
                                {new Date(
                                  selectedElementType.item.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-blue-400">Updated</Label>
                              <div className="text-blue-200">
                                {new Date(
                                  selectedElementType.item.updatedAt
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedElementType.generalAccount && (
                      <div className="space-y-4">
                        {/* General Account Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-400">
                              Account Code
                            </Label>
                            <div className="bg-blue-950/30 border border-blue-500/20 rounded-md p-2">
                              <span className="text-sm font-mono font-medium text-blue-300">
                                {selectedElementType.generalAccount.code}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-blue-400">
                              Description
                            </Label>
                            <div className="bg-blue-950/30 border border-blue-500/20 rounded-md p-2">
                              <span className="text-sm font-medium text-blue-300">
                                {selectedElementType.generalAccount.description}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Account Usage Statistics */}
                        {selectedElementType.generalAccount.lignesCount !==
                          undefined && (
                          <div className="bg-orange-950/30 border border-orange-500/20 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Calculator className="h-4 w-4 text-orange-400" />
                              <Label className="text-sm font-medium text-orange-300">
                                Usage Statistics
                              </Label>
                            </div>
                            <div className="text-sm text-orange-200">
                              This account is used in{" "}
                              <span className="font-semibold">
                                {selectedElementType.generalAccount.lignesCount}
                              </span>{" "}
                              document lines
                            </div>
                          </div>
                        )}

                        {/* Account Metadata */}
                        <div className="border-t border-blue-500/20 pt-3">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <Label className="text-blue-400">Created</Label>
                              <div className="text-blue-200">
                                {new Date(
                                  selectedElementType.generalAccount.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-blue-400">Updated</Label>
                              <div className="text-blue-200">
                                {new Date(
                                  selectedElementType.generalAccount.updatedAt
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Element Type Metadata */}
                <div className="border-t border-blue-500/30 pt-4">
                  <h4 className="text-blue-200 font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Element Type Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-400">Created</Label>
                      <div className="text-blue-200">
                        {new Date(
                          selectedElementType.createdAt
                        ).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-400">
                        Last Updated
                      </Label>
                      <div className="text-blue-200">
                        {new Date(
                          selectedElementType.updatedAt
                        ).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setIsViewDialogOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Dialog */}
        <AlertDialog
          open={isBulkDeleteDialogOpen}
          onOpenChange={setIsBulkDeleteDialogOpen}
        >
          <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-red-500/30 text-white shadow-[0_0_25px_rgba(239,68,68,0.2)] rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-red-300">
                Delete Element Types
              </AlertDialogTitle>
              <AlertDialogDescription className="text-blue-300">
                Are you sure you want to delete {selectedElementTypes.length}{" "}
                element types? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedElementTypes.length > 0 && <BulkActionsBar />}
        </AnimatePresence>

        {/* Create Element Type Wizard */}
        <CreateElementTypeWizard
          open={isCreateWizardOpen}
          onOpenChange={setIsCreateWizardOpen}
          onSuccess={() => {
            fetchData();
            setIsCreateWizardOpen(false);
          }}
          availableItems={items}
          availableGeneralAccounts={generalAccounts}
        />
      </div>
    </>
  );
};

export default LineElementTypeManagement;
