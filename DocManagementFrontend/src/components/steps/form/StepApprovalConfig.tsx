import { useState, useEffect } from "react";
import { useStepForm } from "./StepFormProvider";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, User, Users, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import approvalService from "@/services/approvalService";
import { ApproverInfo, ApprovalGroup } from "@/models/approval";

// Add Approvator interface since it's not exported from approvalService
interface Approvator {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

export const StepApprovalConfig = () => {
  const { formData, setFormData } = useStepForm();
  const [users, setUsers] = useState<ApproverInfo[]>([]);
  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.requiresApproval) {
      fetchData();
    }
  }, [formData.requiresApproval]);

  const fetchData = async () => {
    setError(null);
    if (formData.approvalType === "user" || !formData.approvalType) {
      await fetchUsers();
    }
    if (formData.approvalType === "group" || !formData.approvalType) {
      await fetchGroups();
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // For step approval configuration, get existing approvators (users already in the approvers table)
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

  const handleApprovalTypeChange = (value: string) => {
    if (value === "user" || value === "group") {
      setFormData({
        approvalType: value as "user" | "group",
        approvalUserId: value === "user" ? formData.approvalUserId : undefined,
        approvalGroupId:
          value === "group" ? formData.approvalGroupId : undefined,
      });
    }
  };

  if (!formData.requiresApproval) {
    return (
      <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md rounded-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Info className="h-10 w-10 text-blue-400 mx-auto" />
              <h3 className="text-lg font-medium text-blue-200">
                No Approval Required
              </h3>
              <p className="text-sm text-blue-100/70 max-w-md">
                This step doesn't require approval. Go back to Step Options if
                you want to enable approval for this step.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md rounded-lg">
      <CardContent className="p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">
              Approval Configuration
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Define who can approve documents at this step
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-900/20 border-red-800/40 text-red-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-[#0d1541]/70 border border-blue-900/30 p-3 rounded-md">
            <RadioGroup
              value={formData.approvalType || ""}
              onValueChange={handleApprovalTypeChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label
                  htmlFor="user"
                  className="flex items-center text-blue-200 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4 text-blue-400" /> Individual
                  User Approval
                </Label>
              </div>

              {formData.approvalType === "user" && (
                <div className="ml-6 mt-2">
                  {isLoadingUsers ? (
                    <Skeleton className="h-9 w-full bg-blue-900/20" />
                  ) : (
                    <Select
                      value={formData.approvalUserId?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ approvalUserId: parseInt(value, 10) })
                      }
                    >
                      <SelectTrigger className="bg-[#0a1033] border-blue-900/50 focus:ring-blue-500 text-blue-100">
                        <SelectValue placeholder="Select approver" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1033] border-blue-900/50 text-blue-100">
                        {users.map((user) => (
                          <SelectItem
                            key={user.userId}
                            value={user.userId.toString()}
                          >
                            {user.username} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label
                  htmlFor="group"
                  className="flex items-center text-blue-200 cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4 text-blue-400" /> Approval
                  Group
                </Label>
              </div>

              {formData.approvalType === "group" && (
                <div className="ml-6 mt-2">
                  {isLoadingGroups ? (
                    <Skeleton className="h-9 w-full bg-blue-900/20" />
                  ) : (
                    <Select
                      value={formData.approvalGroupId?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ approvalGroupId: parseInt(value, 10) })
                      }
                    >
                      <SelectTrigger className="bg-[#0a1033] border-blue-900/50 focus:ring-blue-500 text-blue-100">
                        <SelectValue placeholder="Select approval group" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1033] border-blue-900/50 text-blue-100">
                        {groups.map((group) => (
                          <SelectItem
                            key={group.id}
                            value={group.id.toString()}
                          >
                            {group.name} ({group.ruleType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="bg-blue-900/20 rounded-md p-3 border border-blue-500/30">
            <div className="flex">
              <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-blue-300">
                  {formData.approvalType === "user"
                    ? "Individual approval means a single person must approve documents at this step."
                    : formData.approvalType === "group"
                    ? "Group approval allows you to set up complex approval rules with multiple approvers."
                    : "Select an approval type to configure who can approve documents at this step."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
