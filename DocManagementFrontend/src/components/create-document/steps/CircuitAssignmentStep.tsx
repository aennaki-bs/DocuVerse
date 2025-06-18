import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Share2,
  AlertCircle,
  Search,
  CheckCircle,
  Circle,
  FileText,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface Circuit {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  code?: string;
  isActive?: boolean;
  documentTypeId?: number;
  documentType?: {
    id: number;
    typeName: string;
    typeKey?: string;
    typeAttr?: string;
  };
}

interface CircuitAssignmentStepProps {
  circuits: Circuit[];
  selectedCircuitId: number | null;
  circuitError: string | null;
  onCircuitChange: (value: string) => void;
  isLoading: boolean;
}

export const CircuitAssignmentStep = ({
  circuits,
  selectedCircuitId,
  circuitError,
  onCircuitChange,
  isLoading,
}: CircuitAssignmentStepProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // No need to filter by isActive as the API already returns only active circuits
  // Just log the circuits for debugging
  console.log("Circuits passed to component:", circuits);

  // Filter circuits based on search query
  const filteredCircuits = circuits.filter(
    (circuit) =>
      circuit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circuit.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const noCircuitsAvailable = circuits.length === 0;

  const StatusIndicator = ({ isActive }: { isActive?: boolean }) => (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full",
          isActive ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span
        className={cn(
          "text-xs font-medium",
          isActive ? "text-green-400 font-bold" : "text-red-400"
        )}
      >
        {isActive ? t("common.active") : t("common.inactive")}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder={t("circuits.searchCircuits")}
          className="pl-9 bg-gray-900 border-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Circuit Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-blue-400" />
          <Label className="text-sm font-medium text-gray-200">
            {t("circuits.selectCircuit")}{" "}
            <span className="ml-1 text-blue-400">({t("common.optional")})</span>
          </Label>
        </div>

        {isLoading ? (
          <div className="flex items-center space-x-3 text-blue-400 text-sm py-2 px-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent"></div>
            <span>{t("circuits.loadingCircuits")}</span>
          </div>
        ) : noCircuitsAvailable ? (
          <Card className="bg-blue-900/20 border-blue-900/40">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-blue-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {t("circuits.noActiveCircuitsAvailable")}
                  </p>
                  <p className="text-xs mt-1 text-blue-300/80">
                    {t("circuits.noActiveCircuitsDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : filteredCircuits.length === 0 ? (
          <Card className="bg-amber-900/20 border-amber-800/40">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    No circuits found matching your search.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <RadioGroup
            value={selectedCircuitId?.toString() || ""}
            onValueChange={onCircuitChange}
            className="space-y-3"
          >
            <div className="flex text-xs font-medium text-gray-400 px-4 py-2 justify-between border-b border-gray-800">
              <div>Circuit Code</div>
              <div>Title</div>
              <div>Description</div>
              <div>Status</div>
            </div>

            <div className="text-xs text-blue-400 mb-4 px-4 pt-2">
              Select "No Circuit" (default) or choose an{" "}
              <span className="font-bold">active circuit</span> from the list
              below
            </div>

            <div className="bg-blue-900/30 border border-blue-800/50 rounded-md mb-6 p-3 mx-2">
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <Info className="h-3.5 w-3.5 text-blue-400" />
                <span>
                  Only <span className="font-bold">active circuits</span> are
                  displayed and available for selection
                </span>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-800/40 rounded-md mb-6 p-3 mx-2">
              <div className="flex items-center gap-2 text-xs text-green-300">
                <Info className="h-3.5 w-3.5 text-green-400" />
                <span>
                  Circuits are filtered to show only those compatible with your
                  selected document type
                </span>
              </div>
            </div>

            <ScrollArea className="h-[360px] pr-4">
              {/* Add a "No circuit" option */}
              <div
                key="no-circuit"
                className="mb-8 bg-gray-900 border border-gray-800 rounded-md overflow-hidden"
              >
                <div
                  className={cn(
                    "cursor-pointer transition-all p-5",
                    selectedCircuitId === null &&
                      "bg-blue-900/30 border-blue-500"
                  )}
                  onClick={() => onCircuitChange("")}
                >
                  <div className="flex items-center">
                    <RadioGroupItem
                      value=""
                      id="circuit-none"
                      className={cn(
                        "mr-4",
                        selectedCircuitId === null && "text-blue-500"
                      )}
                    />

                    <div className="flex items-center gap-2 w-20">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="font-mono text-sm">--</span>
                    </div>

                    <div className="flex-grow mr-4">
                      <div className="text-blue-400 font-medium">
                        No Circuit
                      </div>
                    </div>

                    <div className="mr-4 text-sm text-gray-400">
                      Document will be static (no workflow)
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCircuitId === null && (
                        <Badge className="bg-blue-600 ml-2 px-3 py-1">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {filteredCircuits.map((circuit) => (
                <div
                  key={circuit.id}
                  className="mb-8 bg-gray-900 border border-gray-800 rounded-md overflow-hidden"
                >
                  <div
                    className={cn(
                      "cursor-pointer transition-all p-5",
                      selectedCircuitId === circuit.id &&
                        "bg-blue-900/30 border-blue-500"
                    )}
                    onClick={() => onCircuitChange(circuit.id.toString())}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem
                        value={circuit.id.toString()}
                        id={`circuit-${circuit.id}`}
                        className={cn(
                          "mr-4",
                          selectedCircuitId === circuit.id && "text-blue-500"
                        )}
                      />

                      <div className="flex items-center gap-2 w-20">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="font-mono text-sm">
                          {circuit.code || "CR01"}
                        </span>
                      </div>

                      <div className="flex-grow mr-4">
                        <div className="text-blue-400 font-medium">
                          {circuit.name}
                        </div>
                      </div>

                      <div className="mr-4 text-sm text-gray-400">
                        {circuit.description}
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusIndicator isActive={true} />
                        {selectedCircuitId === circuit.id && (
                          <Badge className="bg-blue-600 ml-2 px-3 py-1">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </RadioGroup>
        )}

        {circuitError && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {circuitError}
          </p>
        )}
      </div>

      <div className="text-xs text-gray-400 flex items-start gap-2 mt-3 p-2 bg-[#0a1640] rounded-md border border-blue-900/30">
        <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          Assigning a document to a circuit determines its approval workflow.
          Only <span className="text-green-400 font-bold">active</span> circuits
          are available for selection.
        </div>
      </div>
    </div>
  );
};
