import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

interface ComboboxProps {
  options: ComboboxOption[] | null | undefined;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Select an option",
      emptyText = "No results found",
      searchPlaceholder = "Search...",
      className,
      triggerClassName,
      disabled = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Ensure options is always a valid array
    const safeOptions: ComboboxOption[] = React.useMemo(() => {
      // Check if options exists and is an array
      if (!options) return [];
      if (!Array.isArray(options)) return [];

      // Filter out invalid options
      return options.filter(
        (option): option is ComboboxOption =>
          option !== null &&
          option !== undefined &&
          typeof option === "object" &&
          "value" in option &&
          "label" in option
      );
    }, [options]);

    // Find the selected option
    const selectedOption = React.useMemo(() => {
      return safeOptions.find((option) => option.value === value);
    }, [safeOptions, value]);

    // Reset search query when dropdown closes
    React.useEffect(() => {
      if (!open) {
        setSearchQuery("");
      }
    }, [open]);

    return (
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left bg-white border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-blue-900 hover:bg-blue-50 flex items-center dark:bg-[#0d1541]/70 dark:border-blue-900/50 dark:text-white dark:hover:bg-[#182047]/90",
              disabled && "opacity-50 cursor-not-allowed",
              triggerClassName
            )}
            disabled={disabled}
            onClick={() => !disabled && setOpen(true)}
            ref={ref}
          >
            {selectedOption ? (
              <span className="truncate">{selectedOption.label}</span>
            ) : (
              <span className="text-muted-foreground text-blue-300/70">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-blue-300/70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 bg-white border-blue-200 text-blue-900 shadow-lg shadow-blue-900/20 dark:bg-[#0d1541] dark:border-blue-900/50 dark:text-white",
            className
          )}
        >
          <Command className="bg-transparent">
            <div className="flex items-center border-b border-blue-900/20 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-blue-300/70" />
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-transparent text-blue-100 placeholder:text-blue-300/50 focus:outline-none"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            </div>

            {/* Only show CommandEmpty when there are no options or search returns no results */}
            {(safeOptions.length === 0 ||
              (searchQuery &&
                !safeOptions.some(
                  (option) =>
                    option.label
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (option.description &&
                      option.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                ))) && (
              <CommandEmpty className="py-6 text-center text-sm text-blue-300/70">
                {emptyText}
              </CommandEmpty>
            )}

            {/* Only render CommandGroup if we have valid options */}
            {safeOptions.length > 0 && (
              <CommandGroup className="max-h-[300px] overflow-auto">
                {safeOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center py-2 px-3 cursor-pointer hover:bg-blue-800/30 text-blue-100",
                      option.value === value && "bg-blue-800/50"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-blue-400",
                        option.value === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="text-sm">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-blue-300/70 mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
