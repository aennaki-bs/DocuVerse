
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Check, ArrowLeft } from 'lucide-react';

interface StepThreeReviewProps {
  title: string;
  descriptif: string;
  disabled?: boolean;
  onEdit: (step: 1 | 2) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function StepThreeReview({
  title,
  descriptif,
  disabled,
  onEdit,
  onBack,
  onSubmit,
  isSubmitting,
}: StepThreeReviewProps) {
  return (
    <>
      <Card className="mb-2 bg-[#141c37] border-blue-900 shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            Review Circuit
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="ml-2 text-gray-400 hover:text-blue-400 pl-1 pr-1 py-0.5 rounded border border-transparent hover:border-blue-400 transition"
              onClick={() => onEdit(1)}
              disabled={disabled || isSubmitting}
            >
              <Edit className="w-4 h-4 mr-0.5" />
              Edit Title
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col gap-5 text-blue-200">
            <div>
              <span className="font-semibold">Title:</span>
              <span className="ml-2 text-blue-100">{title}</span>
            </div>
            <div>
              <span className="font-semibold">Description:</span>
              <span className="ml-2 text-blue-300">
                {descriptif?.trim()
                  ? descriptif
                  : <span className="italic text-gray-400">No description</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="ml-3 text-gray-400 hover:text-blue-400 pl-1 pr-1 py-0.5 rounded border border-transparent hover:border-blue-400 transition"
                onClick={() => onEdit(2)}
                disabled={disabled || isSubmitting}
              >
                <Edit className="w-4 h-4 mr-0.5" />
                Edit Description
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
          disabled={isSubmitting || !title}
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
