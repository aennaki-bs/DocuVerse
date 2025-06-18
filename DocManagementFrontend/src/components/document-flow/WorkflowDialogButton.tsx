import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkflowDialog } from "./WorkflowDialog";
import { CircuitBoard, Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowDialogButtonProps {
  documentId: number;
  hasCircuit?: boolean;
  buttonClassName?: string;
  showLabel?: boolean;
  iconOnly?: boolean;
  title?: string;
  onWorkflowUpdate?: () => void;
}

export function WorkflowDialogButton({
  documentId,
  hasCircuit = true,
  buttonClassName = "",
  showLabel = true,
  iconOnly = false,
  title = "View Workflow",
  onWorkflowUpdate,
}: WorkflowDialogButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!hasCircuit) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`text-gray-500 ${buttonClassName}`}
              size={iconOnly ? "icon" : "default"}
              disabled
            >
              {iconOnly ? (
                <CircuitBoard className="h-5 w-5" />
              ) : (
                <>
                  <CircuitBoard className="h-5 w-5 mr-2" />
                  {showLabel && "No Workflow"}
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>No workflow assigned to this document</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button
        variant="default"
        className={`bg-blue-600 hover:bg-blue-700 ${buttonClassName}`}
        size={iconOnly ? "icon" : "default"}
        onClick={() => setIsDialogOpen(true)}
      >
        {iconOnly ? (
          <Activity className="h-5 w-5" />
        ) : (
          <>
            <Activity className="h-5 w-5 mr-2" />
            {showLabel && title}
          </>
        )}
      </Button>

      <WorkflowDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        documentId={documentId}
        onWorkflowUpdate={onWorkflowUpdate}
      />
    </>
  );
}
