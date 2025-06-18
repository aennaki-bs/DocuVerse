import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import { Layers, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubTypeManagementHeaderProps {
  documentType: DocumentType | null;
}

export default function SubTypeManagementHeader({
  documentType,
}: SubTypeManagementHeaderProps) {
  const navigate = useNavigate();
  console.log("type :----", documentType);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Layers className="h-6 w-6 text-blue-400" />
          {documentType?.typeName} Subtypes
        </h1>
        <p className="text-blue-300 mt-1">
          Manage subtypes for document type {documentType?.typeName}
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate("/document-types-management")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Document Types
      </Button>
    </div>
  );
}
