import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DocumentType } from "@/models/document";
import { DocumentTypeUpdateRequest } from "@/models/documentType";
import { Layers, ArrowRight, Edit2, Trash2 } from "lucide-react";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        const updatedType: DocumentTypeUpdateRequest = {
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
        if (typeof error.response.data === 'string') {
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

  return (
    <div className="space-y-6 p-6">
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Layers className="mr-3 h-6 w-6 text-blue-400" /> Document Types
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Browse and manage document classification
            </p>
          </div>
          {!isSimpleUser && (
            <Button
              onClick={() => navigate("/document-types-management")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Management View <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type) => (
            <Card
              key={type.id}
              className="bg-[#0f1642] border-blue-900/30 shadow-lg overflow-hidden hover:border-blue-700/50 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-white">
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
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                              onClick={() => openEditDialog(type)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit document type</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                type.documentCounter && type.documentCounter > 0
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              }`}
                              onClick={() =>
                                type.documentCounter === 0 &&
                                openDeleteDialog(type)
                              }
                              disabled={
                                type.documentCounter !== undefined &&
                                type.documentCounter > 0
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {type.documentCounter && type.documentCounter > 0
                              ? "Cannot delete types with documents"
                              : "Delete document type"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-300">
                  Key:{" "}
                  <span className="text-white">{type.typeKey || "N/A"}</span>
                </p>
                {type.typeAttr && (
                  <p className="text-sm text-blue-300 mt-1">
                    Description:{" "}
                    <span className="text-white">{type.typeAttr}</span>
                  </p>
                )}
                <p className="text-sm text-blue-300 mt-2">
                  Documents:{" "}
                  <span className="text-white font-medium">
                    {type.documentCounter || 0}
                  </span>
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-0"
                  onClick={() => navigate(`/documents?typeId=${type.id}`)}
                >
                  View documents
                </Button>
              </CardFooter>
            </Card>
          ))}

          {types.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-blue-900/50 bg-blue-900/10">
              <Layers className="h-12 w-12 text-blue-500/50 mb-4" />
              <h3 className="text-xl font-medium text-blue-300 mb-2">
                No document types found
              </h3>
              <p className="text-blue-400 mb-4">
                Create document types to better organize your documents
              </p>
              {!isSimpleUser && (
                <Button
                  onClick={() => navigate("/document-types-management")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Document Type
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the document type "
              {typeToDelete?.typeName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Document Type</DialogTitle>
            <DialogDescription>
              Update the details of your document type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="typeName" className="text-blue-300 text-sm">
                Type Name
              </label>
              <input
                id="typeName"
                className="bg-[#111633] border border-blue-900/50 rounded p-2 text-white"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="Document Type Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="typeKey" className="text-blue-300 text-sm">
                  Type Code
                </label>
                <input
                  id="typeKey"
                  className="bg-[#111633] border border-blue-900/50 rounded p-2 text-white"
                  value={typeKey}
                  onChange={(e) => setTypeKey(e.target.value)}
                  placeholder="KEY"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="typeAttr" className="text-blue-300 text-sm">
                  Description
                </label>
                <input
                  id="typeAttr"
                  className="bg-[#111633] border border-blue-900/50 rounded p-2 text-white"
                  value={typeAttr}
                  onChange={(e) => setTypeAttr(e.target.value)}
                  placeholder="Description"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
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
    </div>
  );
};

export default DocumentTypes;
