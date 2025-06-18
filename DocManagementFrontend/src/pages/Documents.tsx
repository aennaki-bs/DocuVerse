import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  File,
  Plus,
  Trash,
  Edit,
  Search,
  FileText,
  AlertCircle,
  ArrowUpDown,
  CalendarDays,
  Tag,
  Calendar,
  Filter,
  GitBranch,
  Users,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import documentService from "@/services/documentService";
import { Document } from "@/models/document";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchAndFilterBar } from "@/components/shared/SearchAndFilterBar";
import { FilterContent } from "@/components/shared/FilterContent";
import { FilterBadges, FilterBadge } from "@/components/shared/FilterBadges";
import { BulkActionsBar, BulkAction } from "@/components/shared/BulkActionsBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnimatePresence } from "framer-motion";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import { useTranslation } from "@/hooks/useTranslation";

const mockDocuments: Document[] = [
  {
    id: 1,
    documentKey: "DOC-2023-001",
    title: "Project Proposal",
    content: "This is a sample project proposal document.",
    docDate: new Date().toISOString(),
    status: 1,
    documentAlias: "Project-Proposal-001",
    documentType: { id: 1, typeName: "Proposal" },
    createdBy: {
      id: 1,
      username: "john.doe",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "Admin",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 3,
    typeId: 1,
    createdByUserId: 1,
  },
  {
    id: 2,
    documentKey: "DOC-2023-002",
    title: "Financial Report",
    content: "Quarterly financial report for Q2 2023.",
    docDate: new Date().toISOString(),
    status: 1,
    documentAlias: "Financial-Report-Q2",
    documentType: { id: 2, typeName: "Report" },
    createdBy: {
      id: 2,
      username: "jane.smith",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      role: "FullUser",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 5,
    typeId: 2,
    createdByUserId: 2,
  },
  {
    id: 3,
    documentKey: "DOC-2023-003",
    title: "Meeting Minutes",
    content: "Minutes from the board meeting on August 15, 2023.",
    docDate: new Date().toISOString(),
    status: 0,
    documentAlias: "Board-Minutes-Aug15",
    documentType: { id: 3, typeName: "Minutes" },
    createdBy: {
      id: 1,
      username: "john.doe",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "Admin",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 2,
    typeId: 3,
    createdByUserId: 1,
  },
  {
    id: 4,
    documentKey: "DOC-2023-004",
    title: "Product Specifications",
    content: "Technical specifications for the new product line.",
    docDate: new Date().toISOString(),
    status: 2,
    documentAlias: "Product-Specs-2023",
    documentType: { id: 4, typeName: "Specifications" },
    createdBy: {
      id: 3,
      username: "alex.tech",
      firstName: "Alex",
      lastName: "Tech",
      email: "alex@example.com",
      role: "FullUser",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 8,
    typeId: 4,
    createdByUserId: 3,
  },
  {
    id: 5,
    documentKey: "DOC-2023-005",
    title: "Marketing Strategy",
    content: "Marketing strategy for Q3 and Q4 2023.",
    docDate: new Date().toISOString(),
    status: 1,
    documentAlias: "Marketing-Strategy-Q3Q4",
    documentType: { id: 5, typeName: "Strategy" },
    createdBy: {
      id: 4,
      username: "sarah.marketing",
      firstName: "Sarah",
      lastName: "Marketing",
      email: "sarah@example.com",
      role: "SimpleUser",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lignesCount: 4,
    typeId: 5,
    createdByUserId: 4,
  },
];

const Documents = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, tWithParams } = useTranslation();
  
  // Debug: Check if translations are working
  console.log('Documents page translation test:', t('documents.title'));
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const pageSize = 10;
  const [useFakeData, setUseFakeData] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "documentKey",
    direction: "desc",
  });
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [selectedDocumentForCircuit, setSelectedDocumentForCircuit] =
    useState<Document | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("any");
  const [statusFilter, setStatusFilter] = useState("any");
  const [createdByFilter, setCreatedByFilter] = useState("any");
  const [responsibilityCentreFilter, setResponsibilityCentreFilter] =
    useState("any");
  const [responsibilityCentres, setResponsibilityCentres] = useState<
    ResponsibilityCentreSimple[]
  >([]);

  const canManageDocuments =
    user && (user.role === "Admin" || user.role === "FullUser");

  useEffect(() => {
    fetchDocuments();
    fetchResponsibilityCentres();
  }, []);

  const fetchResponsibilityCentres = async () => {
    try {
      const centres = await responsibilityCentreService.getSimple();
      setResponsibilityCentres(centres);
    } catch (error) {
      console.error("Failed to fetch responsibility centres:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getMyDocuments();
      setDocuments(data);
      setTotalPages(Math.ceil(data.length / pageSize));
      setUseFakeData(false);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error(t("documents.failedToLoad"));
      setDocuments(mockDocuments);
      setTotalPages(Math.ceil(mockDocuments.length / pageSize));
      setUseFakeData(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (useFakeData) {
      toast.info(t("documents.viewingTestData"), {
        duration: 5000,
        position: "top-right",
      });
    }
  }, [useFakeData]);

  const handleLogout = () => {
    logout(navigate);
  };

  const handleSelectDocument = (id: number) => {
    if (!canManageDocuments) {
      toast.error(t("documents.noPermissionSelect"));
      return;
    }

    setSelectedDocuments((prev) => {
      if (prev.includes(id)) {
        return prev.filter((docId) => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (!canManageDocuments) {
      toast.error(t("documents.noPermissionSelect"));
      return;
    }

    if (selectedDocuments.length === getPageDocuments().length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(getPageDocuments().map((doc) => doc.id));
    }
  };

  const openDeleteDialog = (id?: number) => {
    if (!canManageDocuments) {
      toast.error(t("documents.noPermissionDelete"));
      return;
    }

    if (id) {
      setDocumentToDelete(id);
    } else if (selectedDocuments.length > 0) {
      setDocumentToDelete(null);
    } else {
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (documentToDelete) {
        if (useFakeData) {
          setDocuments((prev) =>
            prev.filter((doc) => doc.id !== documentToDelete)
          );
          toast.success(t("documents.documentDeletedSimulated"));
        } else {
          await documentService.deleteDocument(documentToDelete);
          toast.success(t("documents.documentDeleted"));
        }
      } else if (selectedDocuments.length > 0) {
        if (useFakeData) {
          setDocuments((prev) =>
            prev.filter((doc) => !selectedDocuments.includes(doc.id))
          );
          toast.success(
            tWithParams("documents.documentsDeletedSimulated", { count: selectedDocuments.length })
          );
        } else {
          await documentService.deleteMultipleDocuments(selectedDocuments);
          toast.success(
            tWithParams("documents.documentsDeleted", { count: selectedDocuments.length })
          );
        }
        setSelectedDocuments([]);
      }

      if (!useFakeData) {
        fetchDocuments();
      } else {
        setTotalPages(Math.ceil(documents.length / pageSize));
      }
    } catch (error) {
      console.error("Failed to delete document(s):", error);
      toast.error(t("documents.failedToDelete"));
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const openAssignCircuitDialog = (document: Document) => {
    if (!document) {
      toast.error(t("documents.noDocumentSelected"));
      return;
    }

    setSelectedDocumentForCircuit(document);
    setAssignCircuitDialogOpen(true);
  };

  const handleAssignCircuitSuccess = () => {
    toast.success(t("documents.circuitAssignedSuccess"));
    if (!useFakeData) {
      fetchDocuments();
    }
  };

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...documents];

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "title":
            aValue = a.title;
            bValue = b.title;
            break;
          case "documentKey":
            aValue = a.documentKey;
            bValue = b.documentKey;
            break;
          case "documentType":
            aValue = a.documentType.typeName;
            bValue = b.documentType.typeName;
            break;
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case "createdBy":
            aValue = a.createdBy.username;
            bValue = b.createdBy.username;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [documents, sortConfig]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((doc) => {
      // Text search filter
      const matchesSearch =
        !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.typeName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Date range filter
      let matchesDateRange = true;
      if (dateRange && dateRange.from) {
        const docDate = new Date(doc.docDate);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = docDate >= fromDate && docDate <= toDate;
        } else {
          matchesDateRange = docDate >= fromDate;
        }
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "any") {
        matchesStatus = doc.status === parseInt(statusFilter);
      }

      // Document type filter
      let matchesType = true;
      if (typeFilter !== "any") {
        matchesType = doc.documentType.id === parseInt(typeFilter);
      }

      // Created by filter
      let matchesCreatedBy = true;
      if (createdByFilter !== "any") {
        matchesCreatedBy = doc.createdBy.id === parseInt(createdByFilter);
      }

      // Responsibility centre filter
      let matchesResponsibilityCentre = true;
      if (responsibilityCentreFilter !== "any") {
        if (responsibilityCentreFilter === "none") {
          matchesResponsibilityCentre = !doc.responsibilityCentreId;
        } else {
          matchesResponsibilityCentre =
            doc.responsibilityCentreId === parseInt(responsibilityCentreFilter);
        }
      }

      return (
        matchesSearch &&
        matchesDateRange &&
        matchesStatus &&
        matchesType &&
        matchesCreatedBy &&
        matchesResponsibilityCentre
      );
    });
  }, [
    sortedItems,
    searchQuery,
    dateRange,
    statusFilter,
    typeFilter,
    createdByFilter,
    responsibilityCentreFilter,
  ]);

  const getPageDocuments = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredItems.slice(start, end);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredItems.length / pageSize));
    setPage(1); // Reset to first page when filters change
  }, [filteredItems]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border-amber-500/30">
            {t("documents.statusDraft")}
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30">
            {t("documents.statusInProgress")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("common.unknown")}</Badge>;
    }
  };

  const getSortIndicator = (columnKey: string) => {
    if (sortConfig && sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return null;
  };

  const renderSortableHeader = (
    label: string,
    key: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => requestSort(key)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {getSortIndicator(key) || (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </div>
  );

  // Clear all filters
  const clearAllFilters = () => {
    setTypeFilter("any");
    setStatusFilter("any");
    setCreatedByFilter("any");
    setResponsibilityCentreFilter("any");
    setDateRange(undefined);
    setFilterOpen(false);
  };

  // Create filter badges
  const filterBadges: FilterBadge[] = [];

  if (dateRange?.from) {
    filterBadges.push({
      id: "date",
      label: t("documents.dateRange"),
      value: dateRange.to
        ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(
            dateRange.to,
            "MMM d, yyyy"
          )}`
        : format(dateRange.from, "MMM d, yyyy"),
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      onRemove: () => setDateRange(undefined),
    });
  }

  if (statusFilter !== "any") {
    filterBadges.push({
      id: "status",
      label: t("common.status"),
      value:
        statusFilter === "0"
          ? t("documents.statusDraft")
          : statusFilter === "1"
          ? t("documents.statusInProgress")
          : statusFilter === "2"
          ? t("documents.statusCompleted")
          : t("common.unknown"),
      onRemove: () => setStatusFilter("any"),
    });
  }

  if (typeFilter !== "any") {
    filterBadges.push({
      id: "type",
      label: t("common.type"),
      value:
        typeFilter === "1"
          ? t("documents.typeProposal")
          : typeFilter === "2"
          ? t("documents.typeReport")
          : typeFilter === "3"
          ? t("documents.typeMinutes")
          : typeFilter === "4"
          ? t("documents.typeSpecifications")
          : t("documents.typeStrategy"),
      icon: <Tag className="h-3.5 w-3.5" />,
      onRemove: () => setTypeFilter("any"),
    });
  }

  if (responsibilityCentreFilter !== "any") {
    let value = t("common.unknown");
    if (responsibilityCentreFilter === "none") {
      value = t("documents.noCentreAssigned");
    } else {
      const selectedCentre = responsibilityCentres.find(
        (centre) => centre.id.toString() === responsibilityCentreFilter
      );
      value = selectedCentre
        ? `${selectedCentre.code} - ${selectedCentre.descr}`
        : t("common.unknown");
    }

    filterBadges.push({
      id: "responsibilityCentre",
      label: t("documents.responsibilityCentre"),
      value: value,
      icon: <Building2 className="h-3.5 w-3.5" />,
      onRemove: () => setResponsibilityCentreFilter("any"),
    });
  }

  // Create bulk actions
  const bulkActions: BulkAction[] = [];

  if (selectedDocuments.length === 1) {
    bulkActions.push({
      id: "assign-circuit",
      label: t("documents.assignCircuit"),
      icon: <GitBranch className="h-4 w-4" />,
      onClick: () => {
        const selectedDoc = documents.find(
          (doc) => doc.id === selectedDocuments[0]
        );
        if (selectedDoc) {
          openAssignCircuitDialog(selectedDoc);
        }
      },
      className:
        "bg-blue-900/30 border-blue-500/30 text-blue-200 hover:text-blue-100 hover:bg-blue-800/50 hover:border-blue-400/50 transition-all duration-200 shadow-md",
    });
  }

  bulkActions.push({
    id: "delete",
    label: t("common.delete"),
    icon: <Trash className="h-4 w-4" />,
    onClick: () => openDeleteDialog(),
    variant: "destructive",
    className:
      "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
  });

  // Search fields
  const searchFields = [
    { id: "all", label: t("documents.allFields") },
    { id: "title", label: t("common.title") },
    { id: "documentKey", label: t("documents.documentCode") },
    { id: "content", label: t("documents.content") },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={`TEST TRANSLATION: ${t("documents.title")} - ${new Date().toLocaleTimeString()}`}
        description={`SUBTITLE TEST: ${t("documents.subtitle")}`}
        icon={<FileText className="h-6 w-6 text-blue-400" />}
        actions={
          <>
            {useFakeData && (
              <Button
                variant="outline"
                onClick={fetchDocuments}
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/20"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                {t("documents.usingTestData")}
              </Button>
            )}
            {canManageDocuments ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                asChild
              >
                <Link to="/documents/create">
                  <Plus className="h-4 w-4" />
                  {t("documents.newDocument")}
                </Link>
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                      <Plus className="mr-2 h-4 w-4" /> {t("documents.newDocument")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                    <p>{t("documents.onlyAdminCanCreate")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        }
      />

      <div className="bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-6 transition-all">
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchFields={searchFields}
          selectedSearchField={searchField}
          onSearchFieldChange={setSearchField}
          placeholder={t("documents.searchDocuments")}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          filterContent={
            <FilterContent
              title={t("documents.filterDocuments")}
              onClearAll={clearAllFilters}
              onApply={() => setFilterOpen(false)}
            >
              {/* Status filter */}
              <div>
                <label className="block text-sm text-blue-300 mb-1">
                  {t("common.status")}
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder={t("documents.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectItem value="any" className="hover:bg-blue-800/40">
                      {t("documents.anyStatus")}
                    </SelectItem>
                    <SelectItem value="0" className="hover:bg-blue-800/40">
                      {t("documents.statusDraft")}
                    </SelectItem>
                    <SelectItem value="1" className="hover:bg-blue-800/40">
                      {t("documents.statusInProgress")}
                    </SelectItem>
                    <SelectItem value="2" className="hover:bg-blue-800/40">
                      {t("documents.statusCompleted")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document Type filter */}
              <div>
                <label className="block text-sm text-blue-300 mb-1">
                  {t("documents.documentType")}
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder={t("documents.selectType")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectItem value="any" className="hover:bg-blue-800/40">
                      {t("documents.anyType")}
                    </SelectItem>
                    <SelectItem value="1" className="hover:bg-blue-800/40">
                      {t("documents.typeProposal")}
                    </SelectItem>
                    <SelectItem value="2" className="hover:bg-blue-800/40">
                      {t("documents.typeReport")}
                    </SelectItem>
                    <SelectItem value="3" className="hover:bg-blue-800/40">
                      {t("documents.typeMinutes")}
                    </SelectItem>
                    <SelectItem value="4" className="hover:bg-blue-800/40">
                      {t("documents.typeSpecifications")}
                    </SelectItem>
                    <SelectItem value="5" className="hover:bg-blue-800/40">
                      {t("documents.typeStrategy")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Responsibility Centre filter */}
              <div>
                <label className="block text-sm text-blue-300 mb-1">
                  {t("documents.responsibilityCentre")}
                </label>
                <Select
                  value={responsibilityCentreFilter}
                  onValueChange={setResponsibilityCentreFilter}
                >
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder={t("documents.selectCentre")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectItem value="any" className="hover:bg-blue-800/40">
                      {t("documents.anyCentre")}
                    </SelectItem>
                    <SelectItem value="none" className="hover:bg-blue-800/40">
                      {t("documents.noCentreAssigned")}
                    </SelectItem>
                    {responsibilityCentres.map((centre) => (
                      <SelectItem
                        key={centre.id}
                        value={centre.id.toString()}
                        className="hover:bg-blue-800/40"
                      >
                        {centre.code} - {centre.descr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm text-blue-300 mb-1">
                  {t("documents.dateRange")}
                </label>
                <DateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
              </div>
            </FilterContent>
          }
          additionalControls={
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              className="w-auto"
              align="end"
            >
              <Button
                variant="outline"
                size="icon"
                className={`${
                  dateRange
                    ? "bg-[#22306e] text-blue-400 border-blue-500"
                    : "bg-[#22306e] text-gray-400 border-blue-900/30"
                } hover:text-blue-300 ml-2`}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </DateRangePicker>
          }
        />

        <FilterBadges badges={filterBadges} />

        {/* Table */}
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-10 bg-blue-900/20 rounded animate-pulse"></div>
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-16 bg-blue-900/10 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : getPageDocuments().length > 0 ? (
          <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-blue-900/20">
                  <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
                    <TableHead className="w-12 text-blue-300">
                      {canManageDocuments ? (
                        <Checkbox
                          checked={
                            selectedDocuments.length ===
                              getPageDocuments().length &&
                            getPageDocuments().length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          className="border-blue-500/50"
                        />
                      ) : (
                        <span>#</span>
                      )}
                    </TableHead>
                    <TableHead className="text-blue-300 w-52">
                      {renderSortableHeader(
                        t("documents.documentCode"),
                        "documentKey",
                        <Tag className="h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-blue-300">
                      {renderSortableHeader(
                        t("common.title"),
                        "title",
                        <FileText className="h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-blue-300">
                      {renderSortableHeader(
                        t("common.type"),
                        "documentType",
                        <Filter className="h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-blue-300">
                      {renderSortableHeader(
                        t("documents.documentDate"),
                        "docDate",
                        <CalendarDays className="h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-blue-300">
                      {renderSortableHeader(
                        t("documents.createdBy"),
                        "createdBy",
                        <Users className="h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead className="text-blue-300">{t("common.status")}</TableHead>
                    <TableHead className="text-blue-300 text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPageDocuments().map((document, index) => (
                    <TableRow
                      key={document.id}
                      className={`border-blue-900/30 hover:bg-blue-900/20 transition-all ${
                        selectedDocuments.includes(document.id)
                          ? "bg-blue-900/30 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <TableCell>
                        {canManageDocuments ? (
                          <Checkbox
                            checked={selectedDocuments.includes(document.id)}
                            onCheckedChange={() =>
                              handleSelectDocument(document.id)
                            }
                            className="border-blue-500/50"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">
                            {index + 1 + (page - 1) * pageSize}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-blue-300">
                        {document.documentKey}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/documents/${document.id}`}
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                          >
                            {document.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-100">
                        {document.documentType.typeName}
                      </TableCell>
                      <TableCell className="text-blue-100/70 text-sm">
                        {new Date(document.docDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-800 text-xs">
                              {document.createdBy.firstName[0]}
                              {document.createdBy.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-blue-100/80">
                            {document.createdBy.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-100">
                        {getStatusBadge(document.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {canManageDocuments ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                                    onClick={() =>
                                      openAssignCircuitDialog(document)
                                    }
                                  >
                                    <GitBranch className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                                  <p>{t("documents.assignCircuit")}</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                                    asChild
                                  >
                                    <Link to={`/documents/${document.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                                  <p>{t("documents.editDocument")}</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                    onClick={() =>
                                      openDeleteDialog(document.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                                  <p>{t("documents.deleteDocument")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-not-allowed opacity-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                                  <p>
                                    {t("documents.onlyAdminCanEdit")}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-10 w-10 text-blue-400" />}
            title={t("documents.noDocuments")}
            description={
              searchQuery ||
              dateRange ||
              statusFilter !== "any" ||
              typeFilter !== "any"
                ? t("documents.adjustFilters")
                : t("documents.createFirstDocument")
            }
            actionLabel={
              canManageDocuments && !searchQuery ? t("documents.createDocument") : undefined
            }
            actionIcon={
              canManageDocuments && !searchQuery ? (
                <Plus className="h-4 w-4" />
              ) : undefined
            }
            onAction={
              canManageDocuments && !searchQuery
                ? () => navigate("/documents/create")
                : undefined
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1e2a4a] border-blue-900/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              {t("documents.confirmDeletion")}
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              {documentToDelete
                ? t("documents.deleteConfirmMessage")
                : tWithParams("documents.deleteMultipleConfirmMessage", { count: selectedDocuments.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-blue-800 text-blue-300 hover:bg-blue-900/50"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Circuit Dialog */}
      {selectedDocumentForCircuit && (
        <AssignCircuitDialog
          open={assignCircuitDialogOpen}
          onOpenChange={setAssignCircuitDialogOpen}
          documentId={selectedDocumentForCircuit.id}
          documentKey={selectedDocumentForCircuit.documentKey || ""}
          documentTypeId={selectedDocumentForCircuit.typeId}
          onSuccess={handleAssignCircuitSuccess}
        />
      )}

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {canManageDocuments && selectedDocuments.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedDocuments.length}
            entityName={t("nav.documents").toLowerCase()}
            actions={bulkActions}
            icon={<FileText className="w-5 h-5 text-blue-400" />}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;
