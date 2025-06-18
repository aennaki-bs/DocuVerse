import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  GitBranch,
  ChevronDown,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import circuitService from "@/services/circuitService";

interface CircuitSelectionStepProps {
  selectedCircuitId: number | undefined | null;
  onCircuitChange: (circuitId: number | null) => void;
  comments: string;
  onCommentsChange: (comments: string) => void;
  circuitError?: string | null;
}

export const CircuitSelectionStep: React.FC<CircuitSelectionStepProps> = ({
  selectedCircuitId,
  onCircuitChange,
  comments,
  onCommentsChange,
  circuitError,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch circuits
  const { data: circuits, isLoading: isLoadingCircuits } = useQuery({
    queryKey: ["circuits"],
    queryFn: () => circuitService.getAllCircuits(),
  });

  // Filter circuits to only include those that have steps
  const circuitsWithSteps = circuits?.filter(
    (circuit) => circuit.steps && circuit.steps.length > 0
  );

  const selectedCircuit = selectedCircuitId
    ? circuitsWithSteps?.find((circuit) => circuit.id === selectedCircuitId)
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCircuitSelect = (id: number) => {
    onCircuitChange(id);
    setDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="circuit"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <GitBranch className="h-4 w-4 text-blue-400" />
          Document Circuit
        </Label>

        {isLoadingCircuits ? (
          <div className="flex items-center text-gray-400 space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading circuits...</span>
          </div>
        ) : !circuitsWithSteps || circuitsWithSteps.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No circuits with steps are available. Contact an
                    administrator to set up circuits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center justify-between w-full h-10 px-3 py-2 text-base bg-gray-900 border ${
                circuitError
                  ? "border-red-500"
                  : dropdownOpen
                  ? "border-blue-500 ring-1 ring-blue-500/30"
                  : "border-gray-800 hover:border-gray-700"
              } rounded-md text-white transition-all duration-200`}
              data-testid="document-circuit-select"
            >
              <span
                className={selectedCircuitId ? "text-white" : "text-gray-500"}
              >
                {selectedCircuit
                  ? `${selectedCircuit.title}`
                  : "Select a circuit (optional)"}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-900 border border-gray-800 shadow-lg">
                <div className="max-h-60 overflow-auto py-1">
                  {/* Option to clear selection */}
                  <button
                    onClick={() => handleCircuitSelect(0)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 focus:outline-none text-gray-400"
                  >
                    No circuit (document will be static)
                  </button>

                  {/* Circuit options */}
                  {circuitsWithSteps.map((circuit) => (
                    <button
                      key={circuit.id}
                      onClick={() => handleCircuitSelect(circuit.id)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 focus:outline-none ${
                        selectedCircuitId === circuit.id
                          ? "bg-blue-600 bg-opacity-20 text-blue-400"
                          : "text-white"
                      }`}
                    >
                      {circuit.title}
                      {!circuit.isActive && (
                        <span className="text-amber-400 ml-2">(Inactive)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {circuitError && <p className="text-sm text-red-500">{circuitError}</p>}

        {!isLoadingCircuits && selectedCircuit && (
          <Card className="bg-blue-900/10 backdrop-blur-sm border border-blue-800/40">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-400">
                  Circuit Information
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  {selectedCircuit.descriptif || "No description available"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This circuit has {selectedCircuit.steps?.length || 0} steps.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comments */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <Label htmlFor="comments" className="text-sm font-medium text-gray-200">
          Circuit Assignment Comments (Optional)
        </Label>
        <Textarea
          id="comments"
          placeholder="Add any comments about assigning this circuit"
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          className="min-h-20 resize-y border-gray-800 bg-gray-900"
        />
        <p className="text-sm text-gray-400">
          These comments will be visible in the document workflow history.
        </p>
      </div>
    </div>
  );
};
