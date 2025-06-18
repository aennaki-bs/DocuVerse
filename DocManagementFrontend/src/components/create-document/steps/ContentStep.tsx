import { Label } from "@/components/ui/label";
import { FileText, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";

interface ContentStepProps {
  content: string;
  onContentChange: (value: string) => void;
  contentError?: string;
  isExternal?: boolean;
  onExternalChange?: (value: boolean) => void;
  externalReference?: string;
  onExternalReferenceChange?: (value: string) => void;
}

export const ContentStep = ({
  content,
  onContentChange,
  contentError,
  isExternal = false,
  onExternalChange,
  externalReference = "",
  onExternalReferenceChange,
}: ContentStepProps) => {
  const { t } = useTranslation();
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="content"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <FileText className="h-4 w-4 text-blue-400" />
          {t("documents.content")}*
        </Label>

        <textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder={t("documents.enterDocumentContent")}
          rows={5}
          className={`w-full text-base resize-y bg-gray-900 border ${
            contentError ? "border-red-500" : "border-gray-800"
          } text-white placeholder:text-gray-500 p-3 rounded-md`}
        />

        {contentError && <p className="text-sm text-red-500">{contentError}</p>}

        <p className="text-xs text-gray-400">
          {t("documents.contentDescription")}
        </p>
      </div>

      {/* External Document Toggle */}
      <div className="pt-4 border-t border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-400" />
              {t("documents.externalDocument")}
            </Label>
            <p className="text-xs text-gray-400">
              {t("documents.externalDocumentDescription")}
            </p>
          </div>
          <Switch
            checked={isExternal}
            onCheckedChange={onExternalChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      {/* External Reference Field - Only shown when isExternal is true */}
      {isExternal && (
        <div className="space-y-3 pt-2">
          <Label
            htmlFor="externalReference"
            className="text-sm font-medium text-gray-200"
          >
            {t("documents.externalDocumentReference")}
          </Label>
          <Input
            id="externalReference"
            value={externalReference}
            onChange={(e) => onExternalReferenceChange?.(e.target.value)}
            placeholder={t("documents.enterExternalDocumentReference")}
            className="h-10 text-base bg-gray-900 border-gray-800 text-white"
          />
          <p className="text-xs text-gray-400">
            {t("documents.externalDocumentReferenceDescription")}
          </p>
        </div>
      )}
    </div>
  );
};
