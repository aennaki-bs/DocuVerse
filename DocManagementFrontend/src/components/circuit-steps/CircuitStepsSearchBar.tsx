
import { Search } from 'lucide-react';
import { StepSearchBar } from '@/components/steps/table/StepSearchBar';

interface CircuitStepsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CircuitStepsSearchBar = ({
  searchQuery,
  onSearchChange
}: CircuitStepsSearchBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <Search className="h-4 w-4 text-blue-400" />
        <h2 className="text-blue-300 font-medium">Search Steps</h2>
      </div>
      <div className="relative flex-1 max-w-xl w-full">
        <StepSearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
};
