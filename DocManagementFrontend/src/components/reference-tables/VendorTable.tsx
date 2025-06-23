import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import vendorService from "@/services/vendorService";
import { Vendor, UpdateVendorRequest } from "@/models/vendor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Filter, X, Search, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorBulkActionsBar } from "./table/VendorBulkActionsBar";
import SmartPagination from "@/components/shared/SmartPagination";

export default function VendorTable() {
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [countryFilter, setCountryFilter] = useState("any");
  const [sortBy, setSortBy] = useState<keyof Vendor>("vendorCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  // Fetch vendors
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: ({
      vendorCode,
      data,
    }: {
      vendorCode: string;
      data: UpdateVendorRequest;
    }) => vendorService.update(vendorCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setEditingVendor(null);
      setIsEditDialogOpen(false);
      resetEditFormData();
      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: vendorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    },
  });

  // Search fields
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "vendorCode", label: "Code" },
    { id: "name", label: "Name" },
    { id: "city", label: "City" },
    { id: "country", label: "Country" },
    { id: "address", label: "Address" },
  ];

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(vendors.map((v) => v.country).filter(Boolean)),
    ].sort();
    return [
      { id: "any", label: "Any Country", value: "any" },
      ...uniqueCountries.map((country) => ({
        id: country,
        label: country,
        value: country,
      })),
    ];
  }, [vendors]);

  // Filtered and sorted vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendors.filter((vendor) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchInField = (field: string) =>
          field?.toLowerCase().includes(query) || false;

        if (searchField === "all") {
          const searchableFields = [
            vendor.vendorCode,
            vendor.name,
            vendor.city,
            vendor.country,
            vendor.address,
          ];
          if (!searchableFields.some((field) => searchInField(field || ""))) {
            return false;
          }
        } else {
          const fieldValue = vendor[searchField as keyof Vendor] as string;
          if (!searchInField(fieldValue || "")) {
            return false;
          }
        }
      }

      // Country filter
      if (countryFilter !== "any" && vendor.country !== countryFilter) {
        return false;
      }

      return true;
    });

    // Sort
    return filtered.sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      if (sortDirection === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [vendors, searchQuery, searchField, countryFilter, sortBy, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredVendors.length / pageSize);
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVendors.slice(startIndex, startIndex + pageSize);
  }, [filteredVendors, currentPage, pageSize]);

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Reset filters
  const resetEditFormData = () => {
    setEditFormData({
      name: "",
      address: "",
      city: "",
      country: "",
    });
  };

  const handleSort = (field: keyof Vendor) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Vendor) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const headerClass = (field: keyof Vendor) =>
    `cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-200 font-medium ${
      sortBy === field ? "bg-blue-200 dark:bg-blue-800/50" : ""
    }`;

  const handleSelectVendor = (vendorCode: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorCode)
        ? prev.filter((code) => code !== vendorCode)
        : [...prev, vendorCode]
    );
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === paginatedVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(paginatedVendors.map((v) => v.vendorCode));
    }
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditFormData({
      name: vendor.name || "",
      address: vendor.address || "",
      city: vendor.city || "",
      country: vendor.country || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVendor) return;

    await updateMutation.mutateAsync({
      vendorCode: editingVendor.vendorCode,
      data: {
        name: editFormData.name,
        address: editFormData.address,
        city: editFormData.city,
        country: editFormData.country,
      },
    });
  };

  const handleDeleteVendor = async (vendorCode: string) => {
    await deleteMutation.mutateAsync(vendorCode);
    setSelectedVendors((prev) => prev.filter((code) => code !== vendorCode));
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedVendors.map((vendorCode) =>
          deleteMutation.mutateAsync(vendorCode)
        )
      );
      setSelectedVendors([]);
      setDeleteMultipleOpen(false);
      toast.success(`${selectedVendors.length} vendors deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete some vendors");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setCountryFilter("any");
    setFilterOpen(false);
    resetPagination();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Reset pagination when search or filters change
  useMemo(() => {
    resetPagination();
  }, [searchQuery, searchField, countryFilter]);

  // Document-style filter/search bar
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-2 p-4 mb-4 rounded-xl bg-blue-50 dark:bg-[#1e2a4a] shadow-lg border border-blue-200 dark:border-blue-900/40";

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-blue-700 dark:text-blue-300 font-medium">
            Loading vendors...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Error loading vendors. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Document-style Search + Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[120px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {searchFields.find((opt) => opt.id === searchField)?.label ||
                  "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {searchFields.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="hover:bg-blue-800/40"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#22306e] text-blue-100 border border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
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
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-[#1e2a4a] border border-blue-300 dark:border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
            <div className="mb-2 text-blue-800 dark:text-blue-200 font-semibold">
              Advanced Filters
            </div>
            <div className="flex flex-col gap-4">
              {/* Country Filter */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-blue-700 dark:text-blue-200">
                  Country
                </span>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-full bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm rounded-md">
                    <SelectValue>
                      {countries.find((c) => c.value === countryFilter)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40">
                    {countries.map((country) => (
                      <SelectItem
                        key={country.id}
                        value={country.value}
                        className="hover:bg-blue-100 dark:hover:bg-blue-800/40"
                      >
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              {(countryFilter !== "any" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white flex items-center gap-1"
                  onClick={clearAllFilters}
                >
                  <X className="h-3 w-3" /> Clear All
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-4">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm">
          Showing {paginatedVendors.length} of {filteredVendors.length} vendors
          {vendors.length !== filteredVendors.length &&
            ` (${vendors.length} total)`}
        </span>
      </div>

      {/* Bulk Actions */}
      {selectedVendors.length > 0 && (
        <VendorBulkActionsBar
          selectedCount={selectedVendors.length}
          onDelete={() => setDeleteMultipleOpen(true)}
        />
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-[#1e2a4a] border border-blue-200 dark:border-blue-900/40 rounded-xl shadow-lg overflow-hidden">
        {/* Fixed Header */}
        <div className="bg-blue-50 dark:bg-[#22306e] border-b border-blue-200 dark:border-blue-900/40">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-blue-800 dark:text-blue-200">
                  <Checkbox
                    checked={
                      paginatedVendors.length > 0 &&
                      selectedVendors.length === paginatedVendors.length
                    }
                    onCheckedChange={handleSelectAll}
                    className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableHead>
                <TableHead
                  className={headerClass("vendorCode")}
                  onClick={() => handleSort("vendorCode")}
                >
                  <div className="flex items-center">
                    Code
                    {renderSortIcon("vendorCode")}
                  </div>
                </TableHead>
                <TableHead
                  className={headerClass("name")}
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    {renderSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className={headerClass("city")}
                  onClick={() => handleSort("city")}
                >
                  <div className="flex items-center">
                    City
                    {renderSortIcon("city")}
                  </div>
                </TableHead>
                <TableHead
                  className={headerClass("country")}
                  onClick={() => handleSort("country")}
                >
                  <div className="flex items-center">
                    Country
                    {renderSortIcon("country")}
                  </div>
                </TableHead>
                <TableHead
                  className={headerClass("address")}
                  onClick={() => handleSort("address")}
                >
                  <div className="flex items-center">
                    Address
                    {renderSortIcon("address")}
                  </div>
                </TableHead>
                <TableHead className="text-blue-800 dark:text-blue-200 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-blue-200 dark:scrollbar-track-blue-900/20 scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-600/50 hover:scrollbar-thumb-blue-600 dark:hover:scrollbar-thumb-blue-500/70">
          <Table>
            <TableBody>
              {paginatedVendors.map((vendor, index) => (
                <TableRow
                  key={vendor.vendorCode}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-[1.01] border-b border-blue-200 dark:border-blue-700/30"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedVendors.includes(vendor.vendorCode)}
                      onCheckedChange={() =>
                        handleSelectVendor(vendor.vendorCode)
                      }
                      className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-900 dark:text-blue-300">
                    {vendor.vendorCode}
                  </TableCell>
                  <TableCell className="text-blue-800 dark:text-blue-100">
                    {vendor.name}
                  </TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-200">
                    {vendor.city}
                  </TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-200">
                    {vendor.country}
                  </TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-200 max-w-xs truncate">
                    {vendor.address}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(vendor)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-110 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit vendor</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <AlertDialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 transition-all duration-200"
                                  disabled
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete vendor</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent className="bg-white dark:bg-slate-800 text-blue-900 dark:text-white border border-blue-300 dark:border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-blue-700 dark:text-gray-300">
                              This will permanently delete the vendor "
                              {vendor.name}" ({vendor.vendorCode}). This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white dark:bg-slate-700 text-blue-900 dark:text-white hover:bg-blue-100 dark:hover:bg-slate-600 border border-blue-300 dark:border-none">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteVendor(vendor.vendorCode)
                              }
                              className="bg-red-600 hover:bg-red-700"
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

        {/* Smart Pagination */}
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredVendors.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 text-blue-900 dark:text-white border border-blue-300 dark:border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="vendorCode"
                className="text-blue-700 dark:text-blue-300"
              >
                Vendor Code
              </Label>
              <Input
                id="vendorCode"
                value={editingVendor?.vendorCode || ""}
                disabled
                className="bg-blue-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="name"
                className="text-blue-700 dark:text-blue-300"
              >
                Name
              </Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-white dark:bg-slate-700 text-blue-900 dark:text-white border-blue-300 dark:border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="city"
                className="text-blue-700 dark:text-blue-300"
              >
                City
              </Label>
              <Input
                id="city"
                value={editFormData.city}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="bg-white dark:bg-slate-700 text-blue-900 dark:text-white border-blue-300 dark:border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="country"
                className="text-blue-700 dark:text-blue-300"
              >
                Country
              </Label>
              <Input
                id="country"
                value={editFormData.country}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                className="bg-white dark:bg-slate-700 text-blue-900 dark:text-white border-blue-300 dark:border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="address"
                className="text-blue-700 dark:text-blue-300"
              >
                Address
              </Label>
              <Textarea
                id="address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="bg-white dark:bg-slate-700 text-blue-900 dark:text-white border-blue-300 dark:border-slate-600 mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-slate-700 text-white hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={deleteMultipleOpen}
        onOpenChange={setDeleteMultipleOpen}
      >
        <AlertDialogContent className="bg-slate-800 text-white border border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Vendors</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedVendors.length} selected
              vendor(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedVendors.length} vendor(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
