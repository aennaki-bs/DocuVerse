import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Edit,
  MoreHorizontal,
  Trash,
  Eye,
  CircleCheck,
  GripVertical,
  AlertCircle,
  ListTodo,
  ChevronRight,
  ArrowRight,
  UserCheck,
  Users,
  Loader2,
} from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AssignApprovalDialog } from "@/components/workflow/AssignApprovalDialog";
import { StepDetailsDialog } from "@/components/steps/StepDetailsDialog";
import { Step } from "@/models/step";
import approvalService from "@/services/approvalService";

interface StepTableRowProps {
  step: Step;
  isSelected: boolean;
  onSelectStep: (id: number, checked: boolean) => void;
  onDeleteStep?: (step: Step) => void;
  onEditStep?: (step: Step) => void;
  circuitName?: string;
  circuitKey?: string;
  isCircuitActive?: boolean;
  index?: number;
  onReorder?: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: number;
  type: string;
}

interface ApprovalInfo {
  requiresApproval: boolean;
  approvalType?: string;
  approverName?: string;
  groupName?: string;
  isLoading: boolean;
}

export const StepTableRow = ({
  step,
  isSelected,
  onSelectStep,
  onDeleteStep,
  onEditStep,
  circuitName,
  circuitKey,
  isCircuitActive = false,
  index,
  onReorder,
}: StepTableRowProps) => {
  const navigate = useNavigate();
  const ref = React.useRef<HTMLTableRowElement>(null);
  const [isAssignApprovalDialogOpen, setIsAssignApprovalDialogOpen] =
    useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState<ApprovalInfo>({
    requiresApproval: step.requiresApproval,
    isLoading: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchApprovalInfo = async () => {
      if (step.requiresApproval) {
        try {
          setApprovalInfo((prev) => ({ ...prev, isLoading: true }));
          const config = await approvalService.getStepApprovalConfig(step.id);
          console.log(`Fetched approval config for step ${step.id}:`, config);

          if (config) {
            setApprovalInfo({
              requiresApproval: config.requiresApproval,
              approvalType: config.approvalType,
              approverName:
                config.approvalType === "Single"
                  ? config.singleApproverName
                  : undefined,
              groupName:
                config.approvalType === "Group" ? config.groupName : undefined,
              isLoading: false,
            });
          } else {
            // Reset to default state if no config is found
            setApprovalInfo({
              requiresApproval: step.requiresApproval,
              isLoading: false,
            });
          }
        } catch (err) {
          console.error(
            `Failed to fetch approval info for step ${step.id}:`,
            err
          );
          setApprovalInfo((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        // Reset approval info if step doesn't require approval
        setApprovalInfo({
          requiresApproval: false,
          isLoading: false,
        });
      }
    };

    fetchApprovalInfo();
  }, [step.id, step.requiresApproval, refreshKey]);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: "step",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (
        !ref.current ||
        !onReorder ||
        index === undefined ||
        isCircuitActive
      ) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "step",
    item: () => ({ id: step.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !!onReorder && !isCircuitActive,
  });

  const handleAssignApproval = () => {
    setIsAssignApprovalDialogOpen(true);
  };

  const handleApprovalAssigned = () => {
    // Refresh approval information after assignment
    // Use the refresh key to trigger a re-fetch
    setRefreshKey((prev) => prev + 1);
  };

  drag(drop(ref));

  const displayCircuit = () => {
    if (circuitKey && circuitName) {
      return `${circuitKey} - ${circuitName}`;
    } else if (circuitKey) {
      return circuitKey;
    } else if (circuitName) {
      return circuitName;
    } else {
      return `Circuit #${step.circuitId}`;
    }
  };

  // Enhanced status badges with styled design
  const renderStatusBadge = (title?: string, isNext = false) => {
    if (!title)
      return (
        <Badge
          variant="outline"
          className={cn(
            "py-1.5 px-3 font-medium border opacity-70",
            isNext
              ? "text-gray-400 border-gray-700"
              : "text-gray-400 border-gray-700"
          )}
        >
          Not Set
        </Badge>
      );

    return (
      <Badge
        variant="outline"
        className={cn(
          "py-1.5 px-3 font-medium border",
          isNext
            ? "bg-blue-900/15 text-blue-200 border-blue-700/50"
            : "bg-blue-900/20 text-blue-300 border-blue-700/50"
        )}
      >
        {title}
      </Badge>
    );
  };

  // Render approval information
  const renderApprovalInfo = () => {
    if (approvalInfo.isLoading) {
      return (
        <div className="flex items-center space-x-2 text-blue-300/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }

    if (!step.requiresApproval) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-800/50 text-gray-400 border-gray-700"
        >
          No approval required
        </Badge>
      );
    }

    // Case 1: Individual approver with name
    if (
      approvalInfo.approvalType === "Single" &&
      approvalInfo.approverName
    ) {
      return (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 mr-2 text-blue-400" />
          <span className="text-sm text-blue-100 font-semibold">
            {approvalInfo.approverName}
          </span>
        </div>
      );
    }

    // Case 2: Group with name
    if (approvalInfo.approvalType === "Group" && approvalInfo.groupName) {
      return (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-blue-400" />
          <span className="text-sm text-blue-100 font-semibold">
            {approvalInfo.groupName}
          </span>
        </div>
      );
    }

    // Case 3: Individual approver type is set but name is missing
    if (approvalInfo.approvalType === "Single") {
      return (
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 mr-2 text-blue-400" />
          <span className="text-sm text-blue-100 font-semibold">
            Individual Approver
          </span>
        </div>
      );
    }

    // Case 4: Group type is set but name is missing
    if (approvalInfo.approvalType === "Group") {
      return (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-blue-400" />
          <span className="text-sm text-blue-100 font-semibold">
            Approval Group
          </span>
        </div>
      );
    }

    // Case 5: Approval is required but not configured at all
    return (
      <div className="flex items-center">
        <UserCheck className="h-4 w-4 mr-2 text-blue-400" />
        <span className="text-sm text-blue-100 font-semibold">Approver</span>
      </div>
    );
  };

  return (
    <>
      <TableRow
        ref={ref}
        className={cn(
          "border-b border-blue-900/20 transition-colors",
          isSelected ? "bg-blue-900/20" : "hover:bg-blue-950/40",
          isDragging ? "opacity-50" : "opacity-100",
          onReorder && !isCircuitActive ? "cursor-move" : "",
          isCircuitActive ? "bg-blue-900/10" : ""
        )}
        data-handler-id={handlerId}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TableCell className="w-10 px-4 py-3">
          <div className="flex items-center gap-2">
            {onReorder && !isCircuitActive && (
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            )}
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectStep(step.id, !!checked)}
              disabled={isCircuitActive}
              className="border-blue-700/50"
            />
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell w-[15%] px-4 py-3 text-sm text-blue-300/80">
          {step.stepKey}
        </TableCell>
        <TableCell className="w-[30%] px-4 py-3">
          <div className="font-medium text-blue-100">{step.title}</div>
          <div className="text-sm text-blue-300/70 truncate max-w-[250px] mt-0.5 hidden md:block">
            {step.descriptif}
          </div>
        </TableCell>
        <TableCell className="w-[15%] px-4 py-3">
          {renderStatusBadge(step.currentStatusTitle)}
        </TableCell>
        <TableCell className="w-[5%] px-0 py-3">
          <div
            className={cn(
              "flex justify-center items-center transition-all duration-300",
              isHovered ? "text-blue-400" : "text-blue-700/60"
            )}
          >
            <div
              className={cn(
                "transition-all duration-300 ease-in-out transform",
                isHovered ? "translate-x-1 scale-110" : ""
              )}
            >
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </TableCell>
        <TableCell className="w-[15%] px-4 py-3">
          {renderStatusBadge(step.nextStatusTitle, true)}
        </TableCell>
        <TableCell className="w-[15%] px-4 py-3">{renderApprovalInfo()}</TableCell>
        <TableCell className="w-14 px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full hover:bg-blue-900/30",
                  isHovered ? "text-blue-300" : "text-blue-400/60"
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background border-blue-900/30"
            >
              <DropdownMenuItem onClick={() => setIsDetailsDialogOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onEditStep && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        onClick={() => !isCircuitActive && onEditStep(step)}
                        disabled={isCircuitActive}
                        className={
                          isCircuitActive
                            ? "text-muted-foreground cursor-not-allowed"
                            : ""
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                        {isCircuitActive && (
                          <AlertCircle className="ml-2 h-3 w-3 text-amber-400" />
                        )}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    {isCircuitActive && (
                      <TooltipContent side="left">
                        <p className="text-xs">
                          Cannot edit steps in active circuits
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={() => !isCircuitActive && handleAssignApproval()}
                      disabled={isCircuitActive}
                      className={
                        isCircuitActive
                          ? "text-muted-foreground cursor-not-allowed"
                          : ""
                      }
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Assign Approval
                      {isCircuitActive && (
                        <AlertCircle className="ml-2 h-3 w-3 text-amber-400" />
                      )}
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  {isCircuitActive && (
                    <TooltipContent side="left">
                      <p className="text-xs">
                        Cannot assign approval in active circuits
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {onEditStep && onDeleteStep && <DropdownMenuSeparator />}
              {onDeleteStep && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        onClick={() => !isCircuitActive && onDeleteStep(step)}
                        disabled={isCircuitActive}
                        className={
                          isCircuitActive
                            ? "text-muted-foreground cursor-not-allowed"
                            : "text-destructive focus:text-destructive"
                        }
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                        {isCircuitActive && (
                          <AlertCircle className="ml-2 h-3 w-3 text-amber-400" />
                        )}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    {isCircuitActive && (
                      <TooltipContent side="left">
                        <p className="text-xs">
                          Cannot delete steps in active circuits
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <AssignApprovalDialog
        open={isAssignApprovalDialogOpen}
        onOpenChange={setIsAssignApprovalDialogOpen}
        stepId={step.id}
        stepTitle={step.title}
        onSuccess={handleApprovalAssigned}
      />
      <StepDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        step={step}
      />
    </>
  );
};
