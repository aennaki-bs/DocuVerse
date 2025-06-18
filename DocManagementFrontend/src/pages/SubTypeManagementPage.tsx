import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import documentTypeService from "@/services/documentTypeService";
import subTypeService from "@/services/subTypeService";
import SubTypesList from "@/components/document-types/table/subtypes/SubTypesList";
import SubTypeManagementHeader from "@/components/sub-types/components/SubTypeManagementHeader";
import SubTypeManagementLoading from "@/components/sub-types/components/SubTypeManagementLoading";
import SubTypeManagementError from "@/components/sub-types/components/SubTypeManagementError";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers } from "lucide-react";

export default function SubTypeManagementPage() {
  const { id } = useParams<{ id: string }>();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setError("No document type ID provided");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        console.log("Fetching document type data for ID:", id);

        const docTypeId = parseInt(id);
        try {
          const docTypeData = await documentTypeService.getDocumentType(
            docTypeId
          );
          console.log("Document type data received:", docTypeData);

          if (!docTypeData) {
            throw new Error("Document type not found");
          }

          setDocumentType(docTypeData);
        } catch (error) {
          console.error("Failed to fetch document type details:", error);
          setError("Failed to load document type data");
          toast.error("Could not fetch document type details");
        }
      } catch (error) {
        console.error("Failed to initialize subtype management page:", error);
        setError("Failed to load document type data");
        toast.error("Failed to initialize subtype management page");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <SubTypeManagementLoading />;
  }

  if (error || !documentType) {
    return <SubTypeManagementError />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/document-types/${id}`)}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-900/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Document Type
          </Button>
          <h1 className="text-2xl font-semibold text-white flex items-center">
            <Layers className="mr-3 h-6 w-6 text-blue-400" />
            Manage Series: {documentType.typeName}
          </h1>
        </div>
      </div>

      <SubTypesList documentType={documentType} />
    </div>
  );
}
