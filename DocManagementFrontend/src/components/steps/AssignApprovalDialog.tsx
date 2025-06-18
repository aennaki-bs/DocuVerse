import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, User, Users, AlertCircle, Info } from "lucide-react";
import approvalService from "@/services/approvalService";
import {
  ApproverInfo,
  ApprovalGroup,
  ApprovalRuleType,
} from "@/models/approval";
import { Step } from "@/models/step";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Add Approvator interface since it's not exported from approvalService
interface Approvator {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

interface AssignApprovalDialogProps {
  step: Step;
  isOpen: boolean;
  onClose: () => void;
  onApprovalAssigned: () => void;
}

export function AssignApprovalDialog({
  step,
  isOpen,
  onClose,
  onApprovalAssigned,
}: AssignApprovalDialogProps) {
  const [requiresApproval, setRequiresApproval] = useState<boolean>(
    step.requiresApproval || false
  );
  const [approvalType, setApprovalType] = useState<string>("user");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [ruleType, setRuleType] = useState<string>(ApprovalRuleType.Any);
  const [comment, setComment] = useState<string>("");

  const [users, setUsers] = useState<ApproverInfo[]>([]);
  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      fetchStepApprovalConfig();
    }
  }, [isOpen, step.id]);

  const fetchData = async () => {
    setError(null);
    await Promise.all([fetchUsers(), fetchGroups()]);
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // For step approval assignment, get existing approvators (users already in the approvers table)
      const usersList = await approvalService.getAllApprovators();
      
      // Transform Approvator to ApproverInfo for compatibility
      const approversInfo: ApproverInfo[] = usersList.map(approvator => ({
        id: approvator.id,
        userId: approvator.userId,
        username: approvator.username,
        role: undefined, // Role not included in Approvator response
      }));
      
      setUsers(approversInfo);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load approvers. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const groupsList = await approvalService.getAllApprovalGroups();
      setGroups(groupsList);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError("Failed to load approval groups. Please try again.");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchStepApprovalConfig = async () => {
    try {
      const config = await approvalService.getStepApprovalConfig(step.id);
      if (config) {
        setRequiresApproval(config.requiresApproval);
        setApprovalType(config.approvalType || "user");
        setSelectedUserId(config.singleApproverId?.toString() || "");
        setSelectedGroupName(config.groupName || "");
        setRuleType(config.ruleType || ApprovalRuleType.Any);
        setComment(config.comment || "");

        if (config.groupApprovers && config.groupApprovers.length > 0) {
          setSelectedUserIds(
            config.groupApprovers.map((a: ApproverInfo) => a.userId)
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch step approval config:", err);
      // Don't set error, just use default values
    }
  };

  const handleSubmit = async () => {
    if (requiresApproval && approvalType === "user" && !selectedUserId) {
      toast.error("Please select an approver");
      return;
    }

    if (
      requiresApproval &&
      approvalType === "group" &&
      selectedUserIds.length === 0
    ) {
      toast.error("Please select at least one user for the approval group");
      return;
    }

    setIsSubmitting(true);
    try {
      const config = {
        requiresApproval,
        approvalType: requiresApproval ? approvalType : undefined,
        singleApproverId:
          approvalType === "user" ? parseInt(selectedUserId) : undefined,
        groupApproverIds:
          approvalType === "group" ? selectedUserIds : undefined,
        groupName: approvalType === "group" ? selectedGroupName : undefined,
        ruleType: approvalType === "group" ? ruleType : undefined,
        comment,
      };

      await approvalService.configureStepApproval(step.id, config);
      toast.success("Approval configuration saved successfully");
      onApprovalAssigned();
      onClose();
    } catch (error) {
      console.error("Error configuring approval:", error);
      toast.error("Failed to configure approval. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
        <DialogHeader>
          <DialogTitle>Configure Approval for Step</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="requires-approval" className="text-sm font-medium">
              Requires Approval
            </Label>
            <RadioGroup
              value={requiresApproval ? "yes" : "no"}
              onValueChange={(value) => setRequiresApproval(value === "yes")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="approval-yes" />
                <Label htmlFor="approval-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="approval-no" />
                <Label htmlFor="approval-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {requiresApproval && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="approval-type" className="text-sm font-medium">
                  Approval Type
                </Label>
                <RadioGroup
                  value={approvalType}
                  onValueChange={setApprovalType}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="type-user" />
                    <Label htmlFor="type-user" className="flex items-center">
                      <User className="mr-2 h-4 w-4" /> Individual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="type-group" />
                    <Label htmlFor="type-group" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" /> Group
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {approvalType === "user" ? (
                <div className="grid gap-2">
                  <Label htmlFor="user-select" className="text-sm font-medium">
                    Select Approver
                  </Label>
                  {isLoadingUsers ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading approvers...</span>
                    </div>
                  ) : (
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50">
                        <SelectValue placeholder="Select an approver" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2c6b] border-blue-900/50 text-white">
                        {users.map((user) => (
                          <SelectItem
                            key={user.userId}
                            value={user.userId.toString()}
                          >
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="group-name" className="text-sm font-medium">
                      Group Name
                    </Label>
                    <Input
                      id="group-name"
                      value={selectedGroupName}
                      onChange={(e) => setSelectedGroupName(e.target.value)}
                      placeholder="Enter a name for this approval group"
                      className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="rule-type" className="text-sm font-medium">
                      Approval Rule
                    </Label>
                    <Select value={ruleType} onValueChange={setRuleType}>
                      <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50">
                        <SelectValue placeholder="Select approval rule" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2c6b] border-blue-900/50 text-white">
                        <SelectItem value={ApprovalRuleType.Any}>
                          Any - Any one approver can approve
                        </SelectItem>
                        <SelectItem value={ApprovalRuleType.All}>
                          All - All approvers must approve
                        </SelectItem>
                        <SelectItem value={ApprovalRuleType.Sequential}>
                          Sequential - Approvers must approve in sequence
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="users-select"
                      className="text-sm font-medium"
                    >
                      Select Approvers
                    </Label>
                    {isLoadingUsers ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading approvers...</span>
                      </div>
                    ) : (
                      <Select
                        onValueChange={(value) => {
                          const userId = parseInt(value);
                          if (!selectedUserIds.includes(userId)) {
                            setSelectedUserIds([...selectedUserIds, userId]);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50">
                          <SelectValue placeholder="Add approvers" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2c6b] border-blue-900/50 text-white">
                          {users.map((user) => (
                            <SelectItem
                              key={user.userId}
                              value={user.userId.toString()}
                            >
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Selected users list */}
                    <div className="mt-2 space-y-2">
                      {selectedUserIds.length > 0 ? (
                        <div className="bg-blue-900/20 p-2 rounded border border-blue-900/50">
                          <p className="text-sm mb-2">Selected Approvers:</p>
                          <div className="space-y-1">
                            {selectedUserIds.map((userId) => {
                              const user = users.find(
                                (u) => u.userId === userId
                              );
                              return (
                                <div
                                  key={userId}
                                  className="flex justify-between items-center bg-blue-900/30 p-2 rounded"
                                >
                                  <span className="text-sm">
                                    {user?.username || `User #${userId}`}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedUserIds(
                                        selectedUserIds.filter(
                                          (id) => id !== userId
                                        )
                                      )
                                    }
                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  >
                                    ×
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No approvers selected
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="comment" className="text-sm font-medium">
                  Comment (optional)
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any comments about this approval configuration"
                  className="bg-[#111633] border-blue-900/50 text-white resize-none focus:border-blue-500/50"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-blue-800 text-gray-300 hover:bg-blue-900/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
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
