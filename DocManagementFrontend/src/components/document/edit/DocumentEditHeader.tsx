import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Document } from "@/models/document";

interface DocumentEditHeaderProps {
  document: Document | null;
  documentId: string | number;
  onBack: () => void;
  onDocumentFlow: () => void;
}

const DocumentEditHeader: React.FC<DocumentEditHeaderProps> = ({
  document,
  documentId,
  onBack,
  onDocumentFlow,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/documents"
                    className="text-blue-400/80 hover:text-blue-300"
                  >
                    Documents
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/documents/${documentId}`}
                    className="text-blue-400/80 hover:text-blue-300"
                  >
                    {document?.documentKey || documentId}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-blue-100">Edit</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl font-bold text-white mt-2">Edit Document</h1>
        </div>

        <div className="flex space-x-3">
          {/* {document?.circuitId && (
            <Button
              variant="outline"
              size="lg"
              onClick={onDocumentFlow}
              className="border-blue-900/30 text-white hover:bg-blue-900/20"
            >
              <GitBranch className="h-5 w-5 mr-2" /> Document Flow
            </Button>
          )} */}
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="border-blue-900/30 text-white hover:bg-blue-900/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Document
          </Button>
        </div>
      </div>

      {document && (
        <div className="flex items-center">
          <Badge variant="outline" className="font-mono text-sm mr-3">
            {document.documentKey}
          </Badge>
          <p className="text-sm text-gray-400">
            Last updated: {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentEditHeader;
