import { Button } from '@/components/ui/button';
import { Trash, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  disabled?: boolean;
  isDeleting?: boolean;
  isCircuitActive?: boolean;
  isSimpleUser?: boolean;
}

export const BulkActionBar = ({ 
  selectedCount, 
  onBulkDelete,
  disabled = false,
  isDeleting = false,
  isCircuitActive = false,
  isSimpleUser = false
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  const getTooltipMessage = () => {
    if (isDeleting) return "Deleting steps...";
    if (isCircuitActive) return "Cannot delete steps from active circuit";
    if (isSimpleUser) return "You don't have permission to delete steps";
    return "Cannot delete steps";
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg p-4 flex justify-between items-center z-10 mt-4">
      <div>
        <span className="font-medium">{selectedCount}</span> step{selectedCount !== 1 ? 's' : ''} selected
      </div>
      <div className="flex gap-2">
        {disabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled
                  className="bg-red-600/50 hover:bg-red-600/50 cursor-not-allowed opacity-70"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4 mr-2" />
                  )}
                  Delete Selected
                  {!isDeleting && <AlertCircle className="ml-2 h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getTooltipMessage()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant="destructive" 
            onClick={onBulkDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash className="h-4 w-4 mr-2" />
            )}
            Delete Selected
          </Button>
        )}
      </div>
    </div>
  );
};
