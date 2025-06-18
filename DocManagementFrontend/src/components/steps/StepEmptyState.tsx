
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface StepEmptyStateProps {
  onAddStep: () => void;
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

export const StepEmptyState = ({ 
  onAddStep, 
  title = "No Steps Found", 
  description = "You haven't created any steps yet. Steps are essential parts of circuits that define the workflow process.", 
  showAddButton = true 
}: StepEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center bg-muted/30 border border-dashed border-blue-900/30 rounded-lg p-8 h-96">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-10 w-10 text-muted-foreground"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
        {description}
      </p>
      {showAddButton && (
        <Button
          onClick={onAddStep}
          className="mt-6 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Step
        </Button>
      )}
    </div>
  );
};
