import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSignature, Tag } from "lucide-react";

interface DocumentDetailsStepProps {
  title: string;
  documentAlias: string;
  onTitleChange: (value: string) => void;
  onAliasChange: (value: string) => void;
  titleError: string | null;
}

export const DocumentDetailsStep = ({
  title,
  documentAlias,
  onTitleChange,
  onAliasChange,
  titleError,
}: DocumentDetailsStepProps) => {
  return (
    <div className="space-y-6">
      {/* Document Title */}
      <div className="space-y-3">
        <Label
          htmlFor="documentTitle"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <FileSignature className="h-4 w-4 text-blue-400" />
          Document Title*
        </Label>
        <Input
          id="documentTitle"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter document title"
          className={`h-12 text-base bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 ${
            titleError ? "border-red-500" : ""
          }`}
        />
        {titleError && <p className="text-sm text-red-500">{titleError}</p>}
        <p className="text-sm text-gray-400">
          A clear, descriptive title for your document
        </p>
      </div>

      {/* Document Alias */}
      <div className="space-y-3">
        <Label
          htmlFor="documentAlias"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <Tag className="h-4 w-4 text-blue-400" />
          Document Alias
        </Label>
        <Input
          id="documentAlias"
          value={documentAlias}
          onChange={(e) => onAliasChange(e.target.value)}
          placeholder="Enter document alias (optional)"
          className="h-12 text-base bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
        />
        <p className="text-sm text-gray-400">
          An optional short name or reference for this document
        </p>
      </div>
    </div>
  );
};
