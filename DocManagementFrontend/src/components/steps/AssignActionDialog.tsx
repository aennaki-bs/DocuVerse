import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { actionService } from "@/services/actionService";
import { Action, AssignActionToStepDto } from "@/models/action";

interface Step {
  id: number;
  stepKey: string;
  circuitId: number;
  title: string;
  descriptif: string;
  orderIndex: number;
  responsibleRoleId?: number;
  isFinalStep: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AssignActionDialogProps {
  step: Step;
  isOpen: boolean;
  onClose: () => void;
  onActionAssigned: () => void;
}

export function AssignActionDialog({
  step,
  isOpen,
  onClose,
  onActionAssigned,
}: AssignActionDialogProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadActions();
    }
  }, [isOpen]);

  const loadActions = async () => {
    try {
      const response = await actionService.getActions();
      setActions(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load actions",
        variant: "destructive",
      });
    }
  };

  const handleAssignAction = async () => {
    if (!selectedActionId) {
      toast({
        title: "Error",
        description: "Please select an action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data: AssignActionToStepDto = {
        stepId: step.id,
        actionId: parseInt(selectedActionId),
      };
      await actionService.assignToStep(data);
      toast({
        title: "Success",
        description: "Action assigned successfully",
      });
      onActionAssigned();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Action to Step</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="action" className="text-sm font-medium">
              Select Action
            </label>
            <Select
              value={selectedActionId}
              onValueChange={setSelectedActionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action.actionId} value={action.actionId.toString()}>
                    {action.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssignAction} disabled={isLoading}>
            {isLoading ? "Assigning..." : "Assign Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 