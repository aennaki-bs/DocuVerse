import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TitleStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  titleError?: string;
  documentAlias?: string;
  onDocumentAliasChange?: (value: string) => void;
}

export const TitleStep = ({
  title,
  onTitleChange,
  titleError,
  documentAlias = "",
  onDocumentAliasChange,
}: TitleStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="title" className="text-sm font-medium text-gray-200">
          Document Title*
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter document title"
          className="h-12 text-base bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
          error={!!titleError}
        />
        {titleError && <p className="text-sm text-red-500">{titleError}</p>}
      </div>

      {onDocumentAliasChange && (
        <div className="space-y-3">
          <Label
            htmlFor="documentAlias"
            className="text-sm font-medium text-gray-200"
          >
            Document Alias (Optional)
          </Label>
          <Input
            id="documentAlias"
            value={documentAlias}
            onChange={(e) => onDocumentAliasChange(e.target.value)}
            placeholder="Enter document alias"
            className="h-12 text-base bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      )}
    </div>
  );
};
