import { Button } from "@/components/ui/button";
import { GitBranch, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SelectedDocumentsBarProps {
  selectedCount: number;
  openDeleteDialog: () => void;
  openAssignCircuitDialog: () => void;
  showAssignCircuit: boolean;
}

export default function SelectedDocumentsBar({
  selectedCount,
  openDeleteDialog,
  openAssignCircuitDialog,
  showAssignCircuit,
}: SelectedDocumentsBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a1033]/90 border-t border-blue-900/30 p-4 flex justify-between items-center transition-all duration-300 z-10 backdrop-blur-sm">
      <div className="text-blue-100">
        <span className="font-medium">{selectedCount}</span> documents selected
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="border-blue-800/50 text-blue-300 hover:bg-blue-900/30"
        >
          Archive Selected
        </Button>
        <Button
          variant="outline"
          className="border-blue-800/50 text-blue-300 hover:bg-blue-900/30"
        >
          Export Selected
        </Button>
        {showAssignCircuit ? (
          <Button
            variant="outline"
            className="border-blue-500/50 text-blue-500 hover:bg-blue-900/30"
            onClick={openAssignCircuitDialog}
          >
            <GitBranch className="h-4 w-4 mr-2" /> Assign to Circuit
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-500/50 text-blue-500/50 cursor-not-allowed"
                  disabled
                >
                  <GitBranch className="h-4 w-4 mr-2" /> Assign to Circuit
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                <p>Select only one document to assign to a circuit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          variant="destructive"
          onClick={openDeleteDialog}
          className="bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-red-900/30"
        >
          <Trash className="h-4 w-4 mr-2" /> Delete Selected
        </Button>
      </div>
    </div>
  );
}
