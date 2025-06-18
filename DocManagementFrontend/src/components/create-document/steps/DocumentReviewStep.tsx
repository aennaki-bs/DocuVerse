import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentType, CreateDocumentRequest } from "@/models/document";
import { SubType } from "@/models/subtype";
import {
  Calendar,
  Calculator,
  Tag,
  Layers,
  FileText,
  ExternalLink,
  Check,
  GitBranch,
  MessageSquare,
} from "lucide-react";

interface ReviewStepProps {
  formData: CreateDocumentRequest;
  documentTypes: DocumentType[];
  subTypes: SubType[];
  isExternalDocument: boolean;
  circuitComments: string;
}

export const ReviewStep = ({
  formData,
  documentTypes,
  subTypes,
  isExternalDocument,
  circuitComments,
}: ReviewStepProps) => {
  // Find the selected document type and subtype
  const selectedType = documentTypes.find(
    (type) => type.id === formData.typeId
  );
  const selectedSubType = subTypes.find(
    (subType) => subType.id === formData.subTypeId
  );

  // Format dates for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-gray-800">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            Document Review
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Review your document details before submission.
          </p>
        </div>
        <CardContent className="p-0 divide-y divide-gray-800">
          {/* Dates Section */}
          <div className="p-4 space-y-3">
            <h4 className="text-md font-medium text-gray-300 mb-3">
              Document Dates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" />
                  Document Date
                </div>
                <p className="text-sm font-medium text-white">
                  {formatDate(formData.docDate)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-green-400" />
                  Accounting Date
                </div>
                <p className="text-sm font-medium text-white">
                  {formatDate(formData.comptableDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Document Type Section */}
          <div className="p-4 space-y-3">
            <h4 className="text-md font-medium text-gray-300 mb-3">
              Document Classification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  Document Type
                </div>
                <p className="text-sm font-medium text-white">
                  {selectedType ? selectedType.typeName : "Not selected"}
                  {selectedType?.typeKey && (
                    <span className="text-gray-400 ml-1">
                      ({selectedType.typeKey})
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  Document Subtype
                </div>
                <p className="text-sm font-medium text-white">
                  {selectedSubType ? selectedSubType.name : "Not selected"}
                </p>
              </div>
            </div>
          </div>

          {/* Document Information Section */}
          <div className="p-4 space-y-3">
            <h4 className="text-md font-medium text-gray-300 mb-3">
              Document Information
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  Document Title
                </div>
                <p className="text-sm font-medium text-white bg-gray-850 p-3 rounded-md border border-gray-750">
                  {formData.title || "No title provided"}
                </p>
              </div>

              {/* External Document Reference */}
              {isExternalDocument && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-400 flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                    External Reference
                  </div>
                  <p className="text-sm font-medium text-white bg-gray-850 p-3 rounded-md border border-gray-750">
                    {formData.documentExterne ||
                      "No external reference provided"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Circuit Information Section */}
          <div className="p-4 space-y-3">
            <h4 className="text-md font-medium text-gray-300 mb-3">
              Circuit Information
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400 flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-blue-400" />
                  Circuit
                </div>
                <p className="text-sm font-medium text-white">
                  {formData.circuitId
                    ? `Circuit #${formData.circuitId}`
                    : "No circuit assigned (document will be static)"}
                </p>
              </div>

              {/* Circuit Comments */}
              {formData.circuitId && circuitComments && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-green-400" />
                    Circuit Assignment Comments
                  </div>
                  <p className="text-sm font-medium text-white bg-gray-850 p-3 rounded-md border border-gray-750">
                    {circuitComments}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-900 bg-opacity-10 border border-blue-800 rounded-md p-4 flex items-start gap-3">
        <Check className="h-5 w-5 mt-0.5 text-green-400 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-green-400">
            Ready to Submit
          </h4>
          <p className="text-sm text-gray-300 mt-1">
            Please review all the information above and make sure it's correct.
            Click the "Create" button below to submit your document.
          </p>
        </div>
      </div>
    </div>
  );
};
