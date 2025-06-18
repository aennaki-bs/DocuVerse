import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { WorkflowHistoryDialog } from "./WorkflowHistoryDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowHistoryButtonProps {
  documentId: number;
  documentTitle?: string;
  hasCircuit?: boolean;
}

export function WorkflowHistoryButton({
  documentId,
  documentTitle,
  hasCircuit = true,
}: WorkflowHistoryButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!hasCircuit) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed bottom-6 right-6 z-40">
              <Button
                disabled
                className="rounded-full h-14 w-14 bg-gray-700/50 p-0 flex items-center justify-center cursor-not-allowed"
              >
                <History className="h-6 w-6 text-gray-400" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 border-blue-500/30 text-blue-300">
            <p>No workflow history available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg hover:shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-600 p-0 flex items-center justify-center relative"
        >
          <History className="h-6 w-6" />
        </Button>
      </div>

      <WorkflowHistoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        documentId={documentId}
        documentTitle={documentTitle}
      />
    </>
  );
}
