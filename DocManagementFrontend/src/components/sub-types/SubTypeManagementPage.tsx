import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, FileText, Filter, Layers, Plus, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { SubType } from "@/models/subtype";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import { DocumentType } from "@/models/document";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SubTypeList from "./SubTypeList";
import SubTypeCreateDialog from "./SubTypeCreateDialog";
import SubTypeEditDialog from "./SubTypeEditDialog";
import SubTypeDeleteDialog from "./SubTypeDeleteDialog";
import SubTypeFilterBar from "./SubTypeFilterBar";

const SubTypeManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSimpleUser = user?.role === "SimpleUser";

  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);
  const [filteredSubTypes, setFilteredSubTypes] = useState<SubType[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [subTypesData, docTypesData] = await Promise.all([
          subTypeService.getAllSubTypes(),
          documentTypeService.getAllDocumentTypes(),
        ]);
        setSubTypes(subTypesData);
        setDocumentTypes(docTypesData);
        setFilteredSubTypes(
          activeOnly ? subTypesData.filter((st) => st.isActive) : subTypesData
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data", {
          description: "There was an error fetching the subtypes data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeOnly]);

  // Apply filters when search query or document type changes
  useEffect(() => {
    let filtered = [...subTypes];

    // Filter by active status if activeOnly is true
    if (activeOnly) {
      filtered = filtered.filter((st) => st.isActive);
    }

    // Filter by document type if selected
    if (selectedDocTypeId !== null) {
      filtered = filtered.filter(
        (st) => st.documentTypeId === selectedDocTypeId
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (st) =>
          st.name.toLowerCase().includes(query) ||
          st.description.toLowerCase().includes(query) ||
          st.subTypeKey.toLowerCase().includes(query) ||
          st.documentType?.typeName?.toLowerCase().includes(query)
      );
    }

    setFilteredSubTypes(filtered);
  }, [subTypes, searchQuery, selectedDocTypeId, activeOnly]);

  // Handle opening the create dialog
  const handleCreateClick = () => {
    if (isSimpleUser) {
      toast.error("Permission denied", {
        description: "Simple users cannot create subtypes.",
      });
      return;
    }
    setCreateDialogOpen(true);
  };

  // Handle opening the edit dialog
  const handleEditClick = (subType: SubType) => {
    if (isSimpleUser) {
      toast.error("Permission denied", {
        description: "Simple users cannot edit subtypes.",
      });
      return;
    }
    setSelectedSubType(subType);
    setEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteClick = (subType: SubType) => {
    if (isSimpleUser) {
      toast.error("Permission denied", {
        description: "Simple users cannot delete subtypes.",
      });
      return;
    }
    setSelectedSubType(subType);
    setDeleteDialogOpen(true);
  };

  // Handle creating a new subtype
  const handleCreate = async (newSubType: any) => {
    try {
      await subTypeService.createSubType(newSubType);
      toast.success("Subtype created", {
        description: "The subtype was created successfully.",
      });

      // Refresh the subtypes list
      const updatedSubTypes = await subTypeService.getAllSubTypes();
      setSubTypes(updatedSubTypes);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating subtype:", error);
      toast.error("Failed to create subtype", {
        description: "There was an error creating the subtype.",
      });
    }
  };

  // Handle updating a subtype
  const handleUpdate = async (id: number, updatedSubType: any) => {
    try {
      await subTypeService.updateSubType(id, updatedSubType);
      toast.success("Subtype updated", {
        description: "The subtype was updated successfully.",
      });

      // Refresh the subtypes list
      const updatedSubTypes = await subTypeService.getAllSubTypes();
      setSubTypes(updatedSubTypes);
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating subtype:", error);
      toast.error("Failed to update subtype", {
        description: "There was an error updating the subtype.",
      });
    }
  };

  // Handle deleting a subtype
  const handleDelete = async (id: number) => {
    try {
      await subTypeService.deleteSubType(id);
      toast.success("Subtype deleted", {
        description: "The subtype was deleted successfully.",
      });

      // Refresh the subtypes list
      const updatedSubTypes = await subTypeService.getAllSubTypes();
      setSubTypes(updatedSubTypes);
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting subtype:", error);

      // Specific error message for when the subtype is in use
      if (error.response?.data?.includes("used by one or more documents")) {
        toast.error("Cannot delete subtype", {
          description: "This subtype is being used by one or more documents.",
        });
      } else {
        toast.error("Failed to delete subtype", {
          description: "There was an error deleting the subtype.",
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Layers className="mr-3 h-6 w-6 text-blue-400" /> Subtype
              Management
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage document subtypes and their date ranges
            </p>
          </div>

          {!isSimpleUser && (
            <Button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Subtype
            </Button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <SubTypeFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        documentTypes={documentTypes}
        selectedDocTypeId={selectedDocTypeId}
        setSelectedDocTypeId={setSelectedDocTypeId}
        activeOnly={activeOnly}
        setActiveOnly={setActiveOnly}
      />

      {/* Content */}
      <SubTypeList
        subTypes={filteredSubTypes}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isSimpleUser={isSimpleUser}
      />

      {/* Dialogs */}
      <SubTypeCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        documentTypes={documentTypes}
      />

      {selectedSubType && (
        <>
          <SubTypeEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            subType={selectedSubType}
            onSubmit={(updated) => handleUpdate(selectedSubType.id, updated)}
            documentTypes={documentTypes}
          />

          <SubTypeDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            subType={selectedSubType}
            onConfirm={() => handleDelete(selectedSubType.id)}
          />
        </>
      )}
    </div>
  );
};

export default SubTypeManagementPage;
