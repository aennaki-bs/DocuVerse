import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/services/customerService";
import { Customer, UpdateCustomerRequest } from "@/models/customer";
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
import { CustomerBulkActionsBar } from "./table/CustomerBulkActionsBar";
import SmartPagination from "@/components/shared/SmartPagination";

export default function CustomerTable() {
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [countryFilter, setCountryFilter] = useState("any");
  const [sortBy, setSortBy] = useState<keyof Customer>("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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

  // Fetch customers
  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.getAll,
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data: UpdateCustomerRequest;
    }) => customerService.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditingCustomer(null);
      setIsEditDialogOpen(false);
      resetEditFormData();
      toast.success("Customer updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update customer");
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    },
  });

  // Search fields
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "code", label: "Code" },
    { id: "name", label: "Name" },
    { id: "city", label: "City" },
    { id: "country", label: "Country" },
    { id: "address", label: "Address" },
  ];

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(customers.map((c) => c.country).filter(Boolean)),
    ].sort();
    return [
      { id: "any", label: "Any Country", value: "any" },
      ...uniqueCountries.map((country) => ({
        id: country,
        label: country,
        value: country,
      })),
    ];
  }, [customers]);

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchInField = (field: string) =>
          field?.toLowerCase().includes(query) || false;

        if (searchField === "all") {
          const searchableFields = [
            customer.code,
            customer.name,
            customer.city,
            customer.country,
            customer.address,
          ];
          if (!searchableFields.some((field) => searchInField(field || ""))) {
            return false;
          }
        } else {
          const fieldValue = customer[searchField as keyof Customer] as string;
          if (!searchInField(fieldValue || "")) {
            return false;
          }
        }
      }

      // Country filter
      if (countryFilter !== "any" && customer.country !== countryFilter) {
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
  }, [
    customers,
    searchQuery,
    searchField,
    countryFilter,
    sortBy,
    sortDirection,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

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

  const handleSort = (field: keyof Customer) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Customer) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const headerClass = (field: keyof Customer) =>
    `cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-200 font-medium ${
      sortBy === field ? "bg-blue-200 dark:bg-blue-800/50" : ""
    }`;

  const handleSelectCustomer = (code: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map((c) => c.code));
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || "",
      address: customer.address || "",
      city: customer.city || "",
      country: customer.country || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCustomer) return;

    await updateMutation.mutateAsync({
      code: editingCustomer.code,
      data: {
        name: editFormData.name,
        address: editFormData.address,
        city: editFormData.city,
        country: editFormData.country,
      },
    });
  };

  const handleDeleteCustomer = async (code: string) => {
    await deleteMutation.mutateAsync(code);
    setSelectedCustomers((prev) => prev.filter((c) => c !== code));
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedCustomers.map((code) => deleteMutation.mutateAsync(code))
      );
      setSelectedCustomers([]);
      setDeleteMultipleOpen(false);
      toast.success(
        `${selectedCustomers.length} customers deleted successfully`
      );
    } catch (error) {
      toast.error("Failed to delete some customers");
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
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        Error loading customers. Please try again.
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
            <SelectTrigger className="w-[120px] bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm rounded-md">
              <SelectValue>
                {searchFields.find((field) => field.id === searchField)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40">
              {searchFields.map((field) => (
                <SelectItem
                  key={field.id}
                  value={field.id}
                  className="hover:bg-blue-100 dark:hover:bg-blue-800/40"
                >
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 pl-10 pr-8 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm placeholder:text-blue-500 dark:placeholder:text-blue-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
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
              onClick={() => setFilterOpen(!filterOpen)}
              className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-sm rounded-md flex items-center gap-2 ml-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {countryFilter !== "any" && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-200 rounded">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white dark:bg-[#1e2a4a] border border-blue-300 dark:border-blue-900/40 rounded-xl shadow-lg p-4 animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 block">
                  Country
                </label>
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
                  className="text-blue-300 hover:text-white flex items-center gap-1"
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
      <div className="flex items-center gap-2 text-blue-400 mb-4">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm">
          Showing {paginatedCustomers.length} of {filteredCustomers.length}{" "}
          customers
          {customers.length !== filteredCustomers.length &&
            ` (${customers.length} total)`}
        </span>
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <CustomerBulkActionsBar
          selectedCount={selectedCustomers.length}
          onDelete={() => setDeleteMultipleOpen(true)}
          onClearSelection={() => setSelectedCustomers([])}
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
                      paginatedCustomers.length > 0 &&
                      selectedCustomers.length === paginatedCustomers.length
                    }
                    onCheckedChange={handleSelectAll}
                    className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableHead>
                <TableHead
                  className={headerClass("code")}
                  onClick={() => handleSort("code")}
                >
                  <div className="flex items-center">
                    Code
                    {renderSortIcon("code")}
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
              {paginatedCustomers.map((customer, index) => (
                <TableRow
                  key={customer.code}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-[1.01] border-b border-blue-200 dark:border-blue-700/30"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedCustomers.includes(customer.code)}
                      onCheckedChange={() =>
                        handleSelectCustomer(customer.code)
                      }
                      className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-900 dark:text-blue-300">
                    {customer.code}
                  </TableCell>
                  <TableCell className="text-blue-800 dark:text-blue-100">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-200">
                    {customer.city}
                  </TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-200">
                    {customer.country}
                  </TableCell>
                  <TableCell className="text-blue-700 dark:text-blue-200 max-w-xs truncate">
                    {customer.address}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(customer)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-110 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit customer</p>
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
                              <p>Delete customer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent className="bg-white dark:bg-slate-800 text-blue-900 dark:text-white border border-blue-300 dark:border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-blue-700 dark:text-gray-300">
                              This will permanently delete the customer "
                              {customer.name}" ({customer.code}). This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white dark:bg-slate-700 text-blue-900 dark:text-white hover:bg-blue-100 dark:hover:bg-slate-600 border border-blue-300 dark:border-none">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteCustomer(customer.code)
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
          totalItems={filteredCustomers.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerCode" className="text-blue-300">
                Customer Code
              </Label>
              <Input
                id="customerCode"
                value={editingCustomer?.code || ""}
                disabled
                className="bg-slate-700 text-gray-400 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-blue-300">
                Name
              </Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-slate-700 text-white border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-blue-300">
                City
              </Label>
              <Input
                id="city"
                value={editFormData.city}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="bg-slate-700 text-white border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-blue-300">
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
                className="bg-slate-700 text-white border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-blue-300">
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
                className="bg-slate-700 text-white border-slate-600 mt-1"
                rows={3}
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
            <AlertDialogTitle>Delete Selected Customers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCustomers.length}{" "}
              selected customer(s)? This action cannot be undone.
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
              Delete {selectedCustomers.length} customer(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
