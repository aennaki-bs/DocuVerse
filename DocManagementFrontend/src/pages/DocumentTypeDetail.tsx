import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import documentTypeService from "@/services/documentTypeService";
import subTypeService from "@/services/subTypeService";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Layers,
  Plus,
  FileText,
  Calendar,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import SubTypeList from "@/components/sub-types/SubTypeList";

export default function DocumentTypeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No document type ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Parse the ID to a number
        const docTypeId = parseInt(id);

        // Fetch document type details
        const docTypeData = await documentTypeService.getDocumentType(
          docTypeId
        );
        setDocumentType(docTypeData);

        // Fetch subtypes for this document type
        const subTypesData = await subTypeService.getSubTypesByDocType(
          docTypeId
        );
        setSubTypes(subTypesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load document type data");
        toast.error("Could not fetch document type details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !documentType) {
    return (
      <div className="p-6">
        <Card className="bg-red-900/20 border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-red-300">
              {error || "Failed to load document type"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate("/document-types-management")}
              className="border-red-500/30 text-red-400 hover:bg-red-900/30"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Document Types
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/document-types-management")}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-900/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-white">
            Document Type Details
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-900/30"
            onClick={() => navigate(`/document-types/${id}/subtypes`)}
          >
            <Layers className="mr-2 h-4 w-4" />
            Manage Subtypes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-900/30"
            onClick={() => {
              // This would typically open an edit dialog or navigate to an edit page
              toast.info("Edit functionality would be implemented here");
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Document Type Details Card */}
      <Card className="bg-[#0a1033] border-blue-900/30 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#1a2c6b]/50 to-[#0a1033]/50 border-b border-blue-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-400" />
              {documentType.typeName || "Unnamed Type"}
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-blue-900/30 text-blue-300 border-blue-500/30 px-2 py-0.5"
            >
              {documentType.typeKey || "No Code"}
            </Badge>
          </div>
          <CardDescription className="text-blue-300">
            {documentType.typeAttr || "No description available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-blue-300 flex items-center">
                <Tag className="mr-2 h-4 w-4 text-blue-400" />
                <span className="font-medium">Type Code:</span>
                <span className="ml-2 text-white">
                  {documentType.typeKey || "Not set"}
                </span>
              </div>
              <div className="text-sm text-blue-300 flex items-center">
                <FileText className="mr-2 h-4 w-4 text-blue-400" />
                <span className="font-medium">Documents Count:</span>
                <span className="ml-2 text-white">
                  {documentType.documentCounter || 0}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {documentType.createdAt && (
                <div className="text-sm text-blue-300 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2 text-white">
                    {format(new Date(documentType.createdAt), "PPP")}
                  </span>
                </div>
              )}
              {documentType.updatedAt && (
                <div className="text-sm text-blue-300 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2 text-white">
                    {format(new Date(documentType.updatedAt), "PPP")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtypes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Layers className="mr-2 h-5 w-5 text-blue-400" />
            Subtypes
            <Badge
              variant="outline"
              className="ml-2 bg-blue-900/20 text-blue-300 border-blue-500/30"
            >
              {subTypes.length}
            </Badge>
          </h2>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate(`/document-types/${id}/subtypes`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subtype
          </Button>
        </div>

        {subTypes.length === 0 ? (
          <Card className="bg-[#0a1033]/80 border-blue-900/30">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <Layers className="h-12 w-12 text-blue-400/50 mb-4" />
                <h3 className="text-lg font-medium text-blue-300 mb-2">
                  No Subtypes Available
                </h3>
                <p className="text-blue-400/70 max-w-md mb-4">
                  This document type doesn't have any subtypes yet. Subtypes
                  allow you to specify valid date ranges for documents of this
                  type.
                </p>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate(`/document-types/${id}/subtypes`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Subtype
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0a1033]/80 border-blue-900/30">
            <CardContent className="p-0">
              <SubTypeList
                subTypes={subTypes}
                isLoading={false}
                onEdit={() => navigate(`/document-types/${id}/subtypes`)}
                onDelete={() => navigate(`/document-types/${id}/subtypes`)}
                isSimpleUser={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
