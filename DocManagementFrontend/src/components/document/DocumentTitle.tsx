import { Document } from "@/models/document";
import DocumentStatusBadge from "./DocumentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";

interface DocumentTitleProps {
  document: Document | undefined;
  isLoading: boolean;
}

const DocumentTitle = ({ document, isLoading }: DocumentTitleProps) => {
  return (
    <div className="flex items-center">
      <div>
        {isLoading ? (
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Loading...
          </h1>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-mono">
              {document?.documentKey}
            </h1>
            {document && <DocumentStatusBadge status={document.status} />}
            {document?.erpDocumentCode && (
              <Badge className="bg-orange-600/20 text-orange-200 hover:bg-orange-600/30 border-orange-600/30">
                <Archive className="h-3 w-3 mr-1" />
                Archived to ERP
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTitle;
