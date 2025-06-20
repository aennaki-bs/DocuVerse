import { Button } from '@/components/ui/button';
import { Edit, Check, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import documentTypeService from '@/services/documents/documentTypeService';

interface CreateCircuitStepThreeProps {
  title: string;
  descriptif: string;
  documentTypeId?: number;
  disabled?: boolean;
  onEdit: (step: 1 | 2 | 3 | 4) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function CreateCircuitStepThree({
  title,
  descriptif,
  documentTypeId,
  disabled,
  onEdit,
  onBack,
  onSubmit,
  isSubmitting,
}: CreateCircuitStepThreeProps) {
  // Fetch document types to get the selected document type name
  const { data: documentTypes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => documentTypeService.getAllDocumentTypes(),
  });

  const selectedDocumentType = documentTypes?.find(dt => dt.id === documentTypeId);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-medium text-white">Review Circuit</span>
        </div>
        <div className="flex flex-col gap-2 bg-[#171f3c] rounded-lg p-3 text-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Title:</span>
              <span className="ml-2 text-blue-100">{title}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-gray-400 hover:text-blue-400 pl-1 pr-1 py-0.5 rounded border border-transparent hover:border-blue-400 transition"
              onClick={() => onEdit(2)}
              disabled={disabled || isSubmitting}
            >
              <Edit className="w-4 h-4 mr-0.5" />
              Edit Title
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Description:</span>
              <span className="ml-2 text-blue-300">
                {descriptif?.trim()
                  ? descriptif
                  : <span className="italic text-gray-400">No description</span>}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-gray-400 hover:text-blue-400 pl-1 pr-1 py-0.5 rounded border border-transparent hover:border-blue-400 transition"
              onClick={() => onEdit(3)}
              disabled={disabled || isSubmitting}
            >
              <Edit className="w-4 h-4 mr-0.5" />
              Edit Description
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">Document Type:</span>
              <span className="ml-2 text-blue-100">
                {selectedDocumentType?.typeName || 'Unknown Document Type'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-gray-400 hover:text-blue-400 pl-1 pr-1 py-0.5 rounded border border-transparent hover:border-blue-400 transition"
              onClick={() => onEdit(1)}
              disabled={disabled || isSubmitting}
            >
              <Edit className="w-4 h-4 mr-0.5" />
              Edit Type
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={disabled || isSubmitting}
          className="bg-black border-none text-gray-200 hover:bg-blue-950"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !title || !documentTypeId}
          className="bg-blue-700 text-white min-w-[130px] flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              Creating <Check className="ml-1 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Create Circuit <Check className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );
}
