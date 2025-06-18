import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { User, Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import approvalService from "@/services/approvalService";

interface AssignApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepId: number;
  stepTitle: string;
  onSuccess?: () => void;
}

export function AssignApprovalDialog({
  open,
  onOpenChange,
  stepId,
  stepTitle,
  onSuccess,
}: AssignApprovalDialogProps) {
  const { toast } = useToast();
  const [approvalType, setApprovalType] = useState<"Individual" | "Group">(
    "Individual"
  );
  const [selectedApproverId, setSelectedApproverId] = useState<
    number | undefined
  >(undefined);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch individual approvers
  const { data: approvers = [], isLoading: isLoadingApprovers } = useQuery({
    queryKey: ["approvers"],
    queryFn: async () => {
      try {
        const response = await approvalService.getAllApprovators();
        console.log("Fetched approvers:", response);
        return response;
      } catch (error) {
        console.error("Error fetching approvers:", error);
        toast({
          title: "Error",
          description: "Failed to load approvers. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: open,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Fetch approval groups
  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["approvalGroups"],
    queryFn: async () => {
      try {
        const response = await approvalService.getAllApprovalGroups();
        console.log("Fetched approval groups:", response);
        return response;
      } catch (error) {
        console.error("Error fetching approval groups:", error);
        toast({
          title: "Error",
          description: "Failed to load approval groups. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: open,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Reset selections when dialog opens or approval type changes
  useEffect(() => {
    if (approvalType === "Individual") {
      setSelectedGroupId(undefined);
    } else {
      setSelectedApproverId(undefined);
    }
  }, [approvalType]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setApprovalType("Individual");
      setSelectedApproverId(undefined);
      setSelectedGroupId(undefined);

      // Check if step already has approval configuration
      const fetchExistingConfig = async () => {
        try {
          const config = await approvalService.getStepApprovalConfig(stepId);
          console.log("Existing approval config:", config);

          if (config && config.requiresApproval) {
            // Pre-select existing configuration
            if (
              config.approvalType === "Individual" &&
              config.singleApproverId
            ) {
              setApprovalType("Individual");
              setSelectedApproverId(config.singleApproverId);
            } else if (
              config.approvalType === "Group" &&
              config.approvatorsGroupId
            ) {
              setApprovalType("Group");
              setSelectedGroupId(config.approvatorsGroupId);
            }
          }
        } catch (error) {
          console.error("Error fetching existing approval config:", error);
        }
      };

      fetchExistingConfig();
    }
  }, [open, stepId]);

  const handleSubmit = async () => {
    // Validate form
    if (approvalType === "Individual" && !selectedApproverId) {
      toast({
        title: "Selection required",
        description: "Please select an approver",
        variant: "destructive",
      });
      return;
    }

    if (approvalType === "Group" && !selectedGroupId) {
      toast({
        title: "Selection required",
        description: "Please select an approval group",
        variant: "destructive",
      });
      return;
    }

    // Find the selected approver to get the username
    const selectedApprover =
      approvalType === "Individual" && selectedApproverId
        ? approvers.find((approver) => approver.id === selectedApproverId)
        : undefined;

    if (approvalType === "Individual" && !selectedApprover) {
      toast({
        title: "Error",
        description: "Could not find approver information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (approvalType === "Individual" && !selectedApprover.username) {
      toast({
        title: "Error",
        description:
          "Approver has no username. Please select another approver.",
        variant: "destructive",
      });
      return;
    }

    // Find the selected group to get the name
    const selectedGroup =
      approvalType === "Group" && selectedGroupId
        ? groups.find((group) => group.id === selectedGroupId)
        : undefined;

    if (approvalType === "Group" && !selectedGroup) {
      toast({
        title: "Error",
        description: "Could not find group information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (approvalType === "Group" && !selectedGroup.name) {
      toast({
        title: "Error",
        description: "Group has no name. Please select another group.",
        variant: "destructive",
      });
      return;
    }

    // Prepare request data - ensure we're using the approvator ID, not the user ID
    const requestData = {
      requiresApproval: true,
      approvalType,
      // Use the approvator ID directly (not userId)
      singleApproverId:
        approvalType === "Individual" ? selectedApproverId : undefined,
      approverName:
        approvalType === "Individual" ? selectedApprover.username : undefined,
      approvatorsGroupId:
        approvalType === "Group" ? selectedGroupId : undefined,
      groupName: approvalType === "Group" ? selectedGroup.name : undefined,
    };

    // Log the data being sent for debugging
    console.log("Sending approval configuration:", requestData);

    try {
      setIsSubmitting(true);
      await approvalService.configureStepApproval(stepId, requestData);

      toast({
        title: "Approval assigned",
        description: `Step approval successfully configured`,
      });

      if (onSuccess) {
        // Add a small delay before calling onSuccess to ensure backend has processed
        setTimeout(() => {
          onSuccess();
        }, 800);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error configuring step approval:", error);
      toast({
        title: "Error",
        description: "Failed to assign approval. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1033] border-blue-900/50 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Approval for Step</DialogTitle>
          <p className="text-sm text-blue-300 mt-1">{stepTitle}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Approval Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-300">
              Approval Type
            </Label>
            <RadioGroup
              value={approvalType}
              onValueChange={(value) =>
                setApprovalType(value as "Individual" | "Group")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Individual"
                  id="type-individual"
                  className="border-blue-600"
                />
                <Label
                  htmlFor="type-individual"
                  className="text-white flex items-center"
                >
                  <User className="h-4 w-4 mr-1" />
                  Individual
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Group"
                  id="type-group"
                  className="border-blue-600"
                />
                <Label
                  htmlFor="type-group"
                  className="text-white flex items-center"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Group
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Individual Approver or Group Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-300">
              {approvalType === "Individual"
                ? "Select Approver"
                : "Select Approval Group"}
            </Label>

            {approvalType === "Individual" ? (
              // Individual approver selection
              isLoadingApprovers ? (
                <div className="flex items-center space-x-2 text-blue-300 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading approvers...</span>
                </div>
              ) : (
                <Select
                  value={selectedApproverId?.toString()}
                  onValueChange={(value) =>
                    setSelectedApproverId(Number(value))
                  }
                >
                  <SelectTrigger className="bg-blue-950/40 border-blue-900/30 text-white">
                    <SelectValue placeholder="Select an approver" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1033] border-blue-900/50 text-white">
                    {approvers.map((approver) => (
                      <SelectItem
                        key={approver.id}
                        value={approver.id.toString()}
                      >
                        {" "}
                        {approver.username}{" "}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            ) : // Group selection
            isLoadingGroups ? (
              <div className="flex items-center space-x-2 text-blue-300 text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading approval groups...</span>
              </div>
            ) : (
              <Select
                value={selectedGroupId?.toString()}
                onValueChange={(value) => setSelectedGroupId(Number(value))}
              >
                <SelectTrigger className="bg-blue-950/40 border-blue-900/30 text-white">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1033] border-blue-900/50 text-white">
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-blue-900/50 text-gray-300 hover:bg-blue-900/20"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
