import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DocumentType } from "@/models/document";
import {
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import documentService from "@/services/documentService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchAndFilterBar } from "@/components/shared/SearchAndFilterBar";
import { FilterContent } from "@/components/shared/FilterContent";
import { FilterBadges, FilterBadge } from "@/components/shared/FilterBadges";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkActionsBar, BulkAction } from "@/components/shared/BulkActionsBar";
import { AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DocumentTypes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<DocumentType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeKey, setTypeKey] = useState("");
  const [typeAttr, setTypeAttr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [attributeFilter, setAttributeFilter] = useState("any");

  // Determine if user is a simple user for conditional rendering
  const isSimpleUser = user?.role === "SimpleUser";

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getAllDocumentTypes();
      setTypes(data);
    } catch (error) {
      console.error("Failed to fetch document types:", error);
      toast.error("Failed to load document types");
    } finally {
      setIsLoading(false);
    }
  };

  // Only allow non-simple users to delete types
  const openDeleteDialog = (type: DocumentType) => {
    if (isSimpleUser) {
      toast.error("Simple users cannot delete document types");
      return;
    }
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (typeToDelete && typeToDelete.id) {
        await documentService.deleteDocumentType(typeToDelete.id);
        toast.success("Document type deleted successfully");
        fetchTypes();
        setSelectedTypes((prev) => prev.filter((id) => id !== typeToDelete.id));
      }
    } catch (error) {
      console.error("Failed to delete document type:", error);
      toast.error("Failed to delete document type");
    } finally {
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  // Only allow non-simple users to edit types
  const openEditDialog = (type: DocumentType) => {
    if (isSimpleUser) {
      toast.error("Simple users cannot edit document types");
      return;
    }
    setTypeToEdit(type);
    setTypeName(type.typeName || "");
    setTypeKey(type.typeKey || "");
    setTypeAttr(type.typeAttr || "");
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    try {
      if (typeToEdit && typeToEdit.id) {
        const updatedType: DocumentType = {
          ...typeToEdit,
          typeName,
          typeKey,
          typeAttr,
        };

        await documentService.updateDocumentType(typeToEdit.id, updatedType);
        toast.success("Document type updated successfully");
        fetchTypes();
        setEditDialogOpen(false);
        setTypeToEdit(null);
      }
    } catch (error: any) {
      console.error("Failed to update document type:", error);

      // Extract specific error message if available
      let errorMessage = "Failed to update document type";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      toast.error(`Failed to update document type: ${errorMessage}`);
    }
  };

  // Handle bulk delete
  const openBulkDeleteDialog = () => {
    if (selectedTypes.length === 0) {
      toast.error("No document types selected");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      // In a real app, you would have an API endpoint for bulk delete
      // For now, we'll delete them one by one
      for (const typeId of selectedTypes) {
        await documentService.deleteDocumentType(typeId);
      }

      toast.success(
        `${selectedTypes.length} document types deleted successfully`
      );
      fetchTypes();
      setSelectedTypes([]);
    } catch (error) {
      console.error("Failed to delete document types:", error);
      toast.error("Failed to delete document types");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  // Handle selection of document types
  const handleSelectType = (id: number | undefined) => {
    if (!id) return;

    setSelectedTypes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((typeId) => typeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === filteredTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(
        filteredTypes
          .filter((type) => type.id)
          .map((type) => type.id!) as number[]
      );
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setAttributeFilter("any");
    setFilterOpen(false);
  };

  // Filter types based on search query and other filters
  const filteredTypes = types.filter((type) => {
    // Search query filter
    const matchesSearch =
      !searchQuery ||
      (searchField === "all" &&
        ((type.typeName &&
          type.typeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (type.typeKey &&
            type.typeKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (type.typeAttr &&
            type.typeAttr
              .toLowerCase()
              .includes(searchQuery.toLowerCase())))) ||
      (searchField === "name" &&
        type.typeName &&
        type.typeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchField === "key" &&
        type.typeKey &&
        type.typeKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchField === "attr" &&
        type.typeAttr &&
        type.typeAttr.toLowerCase().includes(searchQuery.toLowerCase()));

    // Attribute filter
    const matchesAttribute =
      attributeFilter === "any" ||
      (attributeFilter === "with" &&
        type.typeAttr &&
        type.typeAttr.trim() !== "") ||
      (attributeFilter === "without" &&
        (!type.typeAttr || type.typeAttr.trim() === ""));

    return matchesSearch && matchesAttribute;
  });

  // Create filter badges
  const filterBadges: FilterBadge[] = [];

  if (attributeFilter !== "any") {
    filterBadges.push({
      id: "attribute",
      label: "Attributes",
      value:
        attributeFilter === "with" ? "With Attributes" : "Without Attributes",
      icon: <Tag className="h-3.5 w-3.5" />,
      onRemove: () => setAttributeFilter("any"),
    });
  }

  // Search fields
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "name", label: "Type Name" },
    { id: "key", label: "Type Key" },
    { id: "attr", label: "Attributes" },
  ];

  // Create bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: openBulkDeleteDialog,
      variant: "destructive",
      className:
        "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Document Types"
        description="Browse and manage document classification"
        icon={<Layers className="h-6 w-6 text-blue-400" />}
        actions={
          !isSimpleUser && (
            <>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                onClick={() => navigate("/document-types-management/create")}
              >
                <Plus className="h-4 w-4" />
                New Type
              </Button>
              <Button
                onClick={() => navigate("/document-types-management")}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              >
                Management View <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )
        }
      />

      <div className="bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-6 transition-all">
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchFields={searchFields}
          selectedSearchField={searchField}
          onSearchFieldChange={setSearchField}
          placeholder="Search document types..."
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          filterContent={
            <FilterContent
              title="Filter Document Types"
              onClearAll={clearAllFilters}
              onApply={() => setFilterOpen(false)}
            >
              {/* Attribute filter */}
              <div>
                <label className="block text-sm text-blue-300 mb-1">
                  Attributes
                </label>
                <Select
                  value={attributeFilter}
                  onValueChange={setAttributeFilter}
                >
                  <SelectTrigger className="w-full bg-blue-50 border-blue-200 text-blue-900 dark:bg-[#22306e] dark:text-blue-100 dark:border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Filter by attributes" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200 text-blue-900 dark:bg-[#22306e] dark:text-blue-100 dark:border-blue-900/40">
                    <SelectItem value="any" className="hover:bg-blue-800/40">
                      Any
                    </SelectItem>
                    <SelectItem value="with" className="hover:bg-blue-800/40">
                      With Attributes
                    </SelectItem>
                    <SelectItem
                      value="without"
                      className="hover:bg-blue-800/40"
                    >
                      Without Attributes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FilterContent>
          }
          additionalControls={
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40"
                }
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={
                  viewMode === "table"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40"
                }
              >
                Table View
              </Button>
            </div>
          }
        />

        <FilterBadges badges={filterBadges} />

        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card
                  key={item}
                  className="bg-[#0f1642] border-blue-900/30 shadow-lg h-[180px] animate-pulse"
                >
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-blue-800/30 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-blue-800/30 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-blue-800/30 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 space-y-4">
              <div className="h-10 bg-blue-900/20 rounded animate-pulse"></div>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-blue-900/10 rounded animate-pulse"
                ></div>
              ))}
            </div>
          )
        ) : filteredTypes.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`bg-[#0f1642] border-blue-900/30 shadow-lg overflow-hidden hover:border-blue-700/50 transition-all ${
                    selectedTypes.includes(type.id || 0)
                      ? "border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        {!isSimpleUser && (
                          <Checkbox
                            checked={selectedTypes.includes(type.id || 0)}
                            onCheckedChange={() => handleSelectType(type.id)}
                            className="border-blue-500/50 mr-2"
                          />
                        )}
                        {type.typeName || "Unnamed Type"}
                      </CardTitle>
                      {!isSimpleUser && (
                        <div className="flex items-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                                  onClick={() => openEditDialog(type)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Edit Type</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  onClick={() => openDeleteDialog(type)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Delete Type</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-sm text-blue-200 mb-1">
                      <span className="font-medium">Key:</span>{" "}
                      {type.typeKey || "No key defined"}
                    </div>
                    {type.typeAttr && (
                      <div className="text-sm text-blue-200">
                        <span className="font-medium">Attributes:</span>{" "}
                        {type.typeAttr}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-400 border-blue-900/50 hover:bg-blue-900/30"
                      onClick={() => navigate(`/document-types/${type.id}`)}
                    >
                      View Documents
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-blue-900/20 sticky top-0 z-10">
                    <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
                      {!isSimpleUser && (
                        <TableHead className="w-12 text-blue-300">
                          <Checkbox
                            checked={
                              selectedTypes.length === filteredTypes.length &&
                              filteredTypes.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            className="border-blue-500/50"
                          />
                        </TableHead>
                      )}
                      <TableHead className="text-blue-300">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Type Name
                        </div>
                      </TableHead>
                      <TableHead className="text-blue-300">
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          Key
                        </div>
                      </TableHead>
                      <TableHead className="text-blue-300">
                        Attributes
                      </TableHead>
                      <TableHead className="text-blue-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTypes.map((type) => (
                      <TableRow
                        key={type.id}
                        className={`border-blue-900/30 hover:bg-blue-900/20 ${
                          selectedTypes.includes(type.id || 0)
                            ? "bg-blue-900/30 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        {!isSimpleUser && (
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedTypes.includes(type.id || 0)}
                              onCheckedChange={() => handleSelectType(type.id)}
                              className="border-blue-500/50"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium text-blue-100">
                          {type.typeName || "Unnamed Type"}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {type.typeKey || "No key defined"}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {type.typeAttr || "None"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-400 border-blue-900/50 hover:bg-blue-900/30"
                              onClick={() =>
                                navigate(`/document-types/${type.id}`)
                              }
                            >
                              View
                            </Button>

                            {!isSimpleUser && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                                  onClick={() => openEditDialog(type)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  onClick={() => openDeleteDialog(type)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        ) : (
          <EmptyState
            icon={<Layers className="h-10 w-10 text-blue-400" />}
            title="No document types found"
            description={
              searchQuery || attributeFilter !== "any"
                ? "Try adjusting your search or filters"
                : "Create your first document type to get started"
            }
            actionLabel={
              !isSimpleUser && !searchQuery ? "Create Type" : undefined
            }
            actionIcon={
              !isSimpleUser && !searchQuery ? (
                <Plus className="h-4 w-4" />
              ) : undefined
            }
            onAction={
              !isSimpleUser && !searchQuery
                ? () => navigate("/document-types-management/create")
                : undefined
            }
          />
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1e2a4a] border-blue-900/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Are you sure you want to delete this document type? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-blue-800 text-blue-300 hover:bg-blue-900/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <DialogContent className="bg-[#1e2a4a] border-blue-900/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Confirm Bulk Deletion
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedTypes.length} document
              types? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              className="border-blue-800 text-blue-300 hover:bg-blue-900/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedTypes.length} Types
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#1e2a4a] border-blue-900/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100">
              Edit Document Type
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the details for this document type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200">
                Type Name
              </label>
              <Input
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200">
                Type Key
              </label>
              <Input
                value={typeKey}
                onChange={(e) => setTypeKey(e.target.value)}
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200">
                Type Attributes
              </label>
              <Input
                value={typeAttr}
                onChange={(e) => setTypeAttr(e.target.value)}
                className="bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-blue-800 text-blue-300 hover:bg-blue-900/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {!isSimpleUser && selectedTypes.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTypes.length}
            entityName="document type"
            actions={bulkActions}
            icon={<Layers className="w-5 h-5 text-blue-400" />}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentTypes;
