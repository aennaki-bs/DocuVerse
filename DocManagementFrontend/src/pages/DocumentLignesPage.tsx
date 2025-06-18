import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import documentService from "@/services/documentService";
import DocumentHeader from "@/components/document/DocumentHeader";
import DocumentDetailsTab from "@/components/document/DocumentDetailsTab";
import DocumentLinesTab from "@/components/document/DocumentLinesTab";
import DocumentLoading from "@/components/document/DocumentLoading";
import DocumentNotFound from "@/components/document/DocumentNotFound";

const DocumentLignesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";
  const [activeTab, setActiveTab] = useState<"details" | "lines">("lines");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
  });

  const {
    data: lignes = [],
    isLoading: isLoadingLignes,
    error: lignesError,
  } = useQuery({
    queryKey: ["documentLignes", Number(id)],
    queryFn: () => documentService.getLignesByDocumentId(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (documentError) {
      toast.error("Failed to load document");
      navigate("/documents");
    }

    if (lignesError) {
      toast.error("Failed to load document lines");
    }
  }, [documentError, lignesError, navigate]);

  if (isLoadingDocument) {
    return <DocumentLoading />;
  }

  if (!document) {
    return <DocumentNotFound onNavigateBack={() => navigate("/documents")} />;
  }

  return (
    <div className="min-h-screen bg-blue-25 dark:bg-[#070b28]">
      <DocumentHeader
        document={document}
        onBack={() => navigate("/documents")}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "details" | "lines")
            }
          >
            <div className="inline-flex bg-blue-950/30 p-1 rounded-lg">
              <TabsList className="bg-transparent border-0">
                <TabsTrigger
                  value="lines"
                  className="rounded-md text-sm px-4 py-2.5 bg-transparent data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Document Lines
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="rounded-md text-sm px-4 py-2.5 bg-transparent data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Document Details
                </TabsTrigger>
              </TabsList>
            </div>

            <Link
              to={`/documents/${id}`}
              className="ml-4 text-blue-300 hover:text-blue-200 inline-flex items-center text-sm"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              View complete document details
            </Link>

            <TabsContent value="lines" className="mt-6">
              <DocumentLinesTab
                document={document}
                lignes={lignes}
                canManageDocuments={canManageDocuments}
                isCreateDialogOpen={isCreateDialogOpen}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
              />
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <DocumentDetailsTab document={document} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocumentLignesPage;
