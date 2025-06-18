
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StepTable } from '@/components/steps/StepTable';
import { StepGrid } from '@/components/steps/StepGrid';
import { StepEmptyState } from '@/components/steps/StepEmptyState';
import { StepLoadingState } from '@/components/steps/StepLoadingState';

interface StepsManagementContentProps {
  isLoading: boolean;
  allSteps: Step[];
  steps: Step[];
  circuits: Circuit[];
  viewMode: 'table' | 'grid';
  selectedSteps: number[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectStep: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteStep: (step: Step) => void;
  onEditStep: (step: Step) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  filterOptions: StepFilterOptions;
  setFilterOptions: (options: StepFilterOptions) => void;
  resetFilters: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddStep: () => void;
}

export const StepsManagementContent = ({
  isLoading,
  allSteps,
  steps,
  circuits,
  viewMode,
  selectedSteps,
  searchQuery,
  onSearchChange,
  onSelectStep,
  onSelectAll,
  onDeleteStep,
  onEditStep,
  sortField,
  sortDirection,
  onSort,
  filterOptions,
  setFilterOptions,
  resetFilters,
  currentPage,
  totalPages,
  onPageChange,
  onAddStep
}: StepsManagementContentProps) => {
  return (
    <div className="space-y-4">
      {isLoading ? (
        <StepLoadingState />
      ) : allSteps.length > 0 ? (
        <Card className="bg-[#0f1642] border-blue-900/30 shadow-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl text-white">Workflow Steps</CardTitle>
            <CardDescription className="text-blue-300">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'} {searchQuery ? 'found' : 'available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              {viewMode === 'table' ? (
                <StepTable
                  steps={steps}
                  circuits={circuits}
                  selectedSteps={selectedSteps}
                  onSelectStep={onSelectStep}
                  onSelectAll={onSelectAll}
                  onDelete={onDeleteStep}
                  onEdit={onEditStep}
                  onSort={onSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  filterOptions={filterOptions}
                  setFilterOptions={setFilterOptions}
                  resetFilters={resetFilters}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              ) : (
                <StepGrid
                  steps={steps}
                  circuits={circuits}
                  onDeleteStep={onDeleteStep}
                  onEditStep={onEditStep}
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                />
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <StepEmptyState onAddStep={onAddStep} />
      )}
    </div>
  );
};
