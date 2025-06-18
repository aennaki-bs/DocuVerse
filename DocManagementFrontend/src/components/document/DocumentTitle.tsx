import { Document } from "@/models/document";
import DocumentStatusBadge from "./DocumentStatusBadge";

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
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTitle;
