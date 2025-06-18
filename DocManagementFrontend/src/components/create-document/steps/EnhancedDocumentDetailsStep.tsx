import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSignature, Tag, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface EnhancedDocumentDetailsStepProps {
  title: string;
  documentAlias: string;
  documentInfo: string;
  isExternal: boolean;
  onTitleChange: (value: string) => void;
  onAliasChange: (value: string) => void;
  onDocumentInfoChange: (value: string) => void;
  onExternalChange: (value: boolean) => void;
  titleError: string | null;
}

export const EnhancedDocumentDetailsStep = ({
  title,
  documentAlias,
  documentInfo,
  isExternal,
  onTitleChange,
  onAliasChange,
  onDocumentInfoChange,
  onExternalChange,
  titleError,
}: EnhancedDocumentDetailsStepProps) => {
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

      {/* External Document Switch */}
      <div className="pt-4 border-t border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-400" />
              External Document
            </Label>
            <p className="text-xs text-gray-400">
              Mark this document as external (from outside the organization)
            </p>
          </div>
          <Switch
            checked={isExternal}
            onCheckedChange={onExternalChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      {/* Document Information */}
      <div className="space-y-3 pt-4 border-t border-gray-800/50">
        <Label
          htmlFor="documentInfo"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <FileSignature className="h-4 w-4 text-blue-400" />
          Document Information
        </Label>
        <Textarea
          id="documentInfo"
          value={documentInfo}
          onChange={(e) => onDocumentInfoChange(e.target.value)}
          placeholder="Enter detailed information about this document..."
          className="min-h-[200px] text-base bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 resize-y"
        />
        <p className="text-sm text-gray-400">
          Provide additional context, notes, or details about this document
        </p>
      </div>

      {isExternal && (
        <div className="p-3 bg-blue-900/20 border border-blue-800/40 rounded-md">
          <div className="flex items-start gap-2">
            <ExternalLink className="h-5 w-5 mt-0.5 text-blue-400" />
            <div>
              <p className="text-sm text-blue-300 font-medium">
                External Document
              </p>
              <p className="text-xs text-gray-300 mt-1">
                This document will be marked as originating from an external
                source. Additional metadata fields may be required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
