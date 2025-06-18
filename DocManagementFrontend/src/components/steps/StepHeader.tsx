
import { Grid2X2, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";

interface StepHeaderProps {
  onAddStep: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (value: 'table' | 'grid') => void;
}

export const StepHeader = ({ 
  onAddStep, 
  viewMode, 
  onViewModeChange 
}: StepHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <Button onClick={onAddStep} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        Add Step
      </Button>
      
      <ToggleGroup 
        type="single" 
        value={viewMode}
        onValueChange={(value) => {
          if (value) onViewModeChange(value as 'table' | 'grid');
        }}
      >
        <ToggleGroupItem value="table" aria-label="Table view">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <Grid2X2 className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
