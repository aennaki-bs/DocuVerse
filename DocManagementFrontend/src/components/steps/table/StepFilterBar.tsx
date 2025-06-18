
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepFilterBarProps {
  circuits: Circuit[];
  filterOptions: StepFilterOptions;
  setFilterOptions: (options: StepFilterOptions) => void;
  resetFilters: () => void;
}

export const StepFilterBar = ({
  circuits,
  filterOptions,
  setFilterOptions,
  resetFilters,
}: StepFilterBarProps) => {
  const [open, setOpen] = useState(false);

  const handleCircuitSelect = (circuitId: number | undefined) => {
    setFilterOptions({ ...filterOptions, circuit: circuitId });
    setOpen(false);
  };

  const handleFinalStepToggle = (value: boolean | undefined) => {
    setFilterOptions({ ...filterOptions, isFinalStep: value });
  };

  const activeFiltersCount = Object.values(filterOptions).filter(
    (value) => value !== undefined
  ).length;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex justify-between min-w-[200px]"
          >
            {filterOptions.circuit
              ? circuits.find((c) => c.id === filterOptions.circuit)?.title || "Unknown Circuit"
              : "Filter by Circuit"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search circuits..." />
            <CommandList>
              <CommandEmpty>No circuits found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleCircuitSelect(undefined)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !filterOptions.circuit ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All Circuits
                </CommandItem>
                {circuits.map((circuit) => (
                  <CommandItem
                    key={circuit.id}
                    onSelect={() => handleCircuitSelect(circuit.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        filterOptions.circuit === circuit.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {circuit.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex justify-between min-w-[200px]"
          >
            {filterOptions.isFinalStep !== undefined
              ? filterOptions.isFinalStep
                ? "Final Steps"
                : "Non-Final Steps"
              : "Filter by Step Type"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleFinalStepToggle(undefined)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filterOptions.isFinalStep === undefined ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All Step Types
                </CommandItem>
                <CommandItem
                  onSelect={() => handleFinalStepToggle(true)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filterOptions.isFinalStep === true ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Final Steps
                </CommandItem>
                <CommandItem
                  onSelect={() => handleFinalStepToggle(false)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filterOptions.isFinalStep === false ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Non-Final Steps
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={resetFilters}
          className="rounded-full"
          title="Clear all filters"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}

      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
        </Badge>
      )}
    </div>
  );
};
