import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DocumentInfoStepProps {
  title: string;
  isExternalDocument: boolean;
  documentExterne: string;
  onTitleChange: (value: string) => void;
  onExternalDocumentChange: (value: string) => void;
  onToggleExternalDocument: (value: boolean) => void;
  errors: {
    title?: string;
    documentExterne?: string;
  };
}

export const DocumentInfoStep = ({
  title,
  isExternalDocument,
  documentExterne,
  onTitleChange,
  onExternalDocumentChange,
  onToggleExternalDocument,
  errors,
}: DocumentInfoStepProps) => {
  return (
    <div className="space-y-6">
      {/* Document Title */}
      <div className="space-y-3">
        <Label
          htmlFor="title"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <FileText className="h-4 w-4 text-blue-400" />
          Document Title*
        </Label>
        <Textarea
          id="title"
          placeholder="Enter document title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`min-h-20 resize-y ${
            errors.title ? "border-red-500" : "border-gray-800"
          }`}
          data-testid="document-title"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        <p className="text-sm text-gray-400">
          Provide a descriptive title for your document.
        </p>
      </div>

      {/* External Document Toggle */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="isExternal"
            className="text-sm font-medium text-gray-200 flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 text-purple-400" />
            External Document
          </Label>
          <Switch
            id="isExternal"
            checked={isExternalDocument}
            onCheckedChange={onToggleExternalDocument}
          />
        </div>
        <p className="text-sm text-gray-400">
          Toggle if this document references an external source.
        </p>

        {/* External Document Reference - Only shown when isExternalDocument is true */}
        {isExternalDocument && (
          <div className="space-y-3 mt-4 ml-4 pl-4 border-l-2 border-gray-800">
            <Label
              htmlFor="documentExterne"
              className="text-sm font-medium text-gray-200"
            >
              External Reference
            </Label>
            <Input
              id="documentExterne"
              placeholder="Enter external document reference"
              value={documentExterne}
              onChange={(e) => onExternalDocumentChange(e.target.value)}
              className={
                errors.documentExterne ? "border-red-500" : "border-gray-800"
              }
              data-testid="external-document-reference"
            />
            {errors.documentExterne && (
              <p className="text-sm text-red-500">{errors.documentExterne}</p>
            )}
            <p className="text-sm text-gray-400">
              Provide a reference to the external document (e.g., URL, file
              location, reference number).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
