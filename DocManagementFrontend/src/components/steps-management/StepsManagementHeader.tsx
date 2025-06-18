
import { Button } from '@/components/ui/button';
import { StepHeader } from '@/components/steps/StepHeader';

interface StepsManagementHeaderProps {
  onAddStep: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

export const StepsManagementHeader = ({
  onAddStep,
  viewMode,
  onViewModeChange
}: StepsManagementHeaderProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Steps Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage workflow steps for your circuits
          </p>
        </div>
      </div>

      <StepHeader
        onAddStep={onAddStep}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </>
  );
};
