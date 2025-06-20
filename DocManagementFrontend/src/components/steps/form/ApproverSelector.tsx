import { useState, useEffect, useMemo, useRef } from "react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import approvalService from "@/services/approvalService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  Users,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApprovalRuleType } from "@/models/approval";

// Add Approvator interface since it's not exported from approvalService
interface Approvator {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

interface ApproverSelectorProps {
  selectedUserId?: number;
  selectedGroupId?: number;
  onUserSelected: (userId: number | undefined) => void;
  onGroupSelected: (groupId: number | undefined) => void;
  approvalType: "individual" | "group";
  onApprovalTypeChange: (type: "individual" | "group") => void;
  disabled?: boolean;
}

interface ApproverInfo {
  userId: number;
  username: string;
  role?: string;
}

interface ApprovalGroup {
  id: number;
  name: string;
  ruleType: ApprovalRuleType;
  approvers?: { userId: number; username: string }[];
}

export function ApproverSelector({
  selectedUserId,
  selectedGroupId,
  onUserSelected,
  onGroupSelected,
  approvalType,
  onApprovalTypeChange,
  disabled = false,
}: ApproverSelectorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approvers, setApprovers] = useState<ApproverInfo[]>([]);
  const [groups, setGroups] = useState<ApprovalGroup[]>([]);
  const [selectedApprover, setSelectedApprover] = useState<ApproverInfo | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(
    null
  );
  const [isGroupMembersExpanded, setIsGroupMembersExpanded] = useState(false);

  // Add refs to directly manipulate the dropdown elements for manual selection
  const approverSelectRef = useRef<HTMLButtonElement>(null);
  const groupSelectRef = useRef<HTMLButtonElement>(null);

  // Force rerender when needed
  const [forceUpdate, setForceUpdate] = useState(0);

  // Create options with useMemo to prevent unnecessary recomputation
  const approverOptions = useMemo<ComboboxOption[]>(() => {
    if (!Array.isArray(approvers)) return [];

    return approvers.map((approver) => ({
      value: approver.userId.toString(),
      label: approver.username || "Unknown user",
      description: approver.role || "No role assigned",
    }));
  }, [approvers]);

  const groupOptions = useMemo<ComboboxOption[]>(() => {
    if (!Array.isArray(groups)) return [];

    return groups.map((group) => ({
      value: group.id.toString(),
      label: group.name || "Unnamed group",
      description: `${group.ruleType || "Unknown"} approval • ${
        Array.isArray(group.approvers) ? group.approvers.length : 0
      } member${group.approvers && group.approvers.length !== 1 ? "s" : ""}`,
    }));
  }, [groups]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, []);

  // Manual direct selection when selectedUserId or selectedGroupId change
  useEffect(() => {
    if (selectedUserId) {
      const matchingApprover = approvers.find(
        (a) => a.userId === selectedUserId
      );
      if (matchingApprover) {
        setSelectedApprover(matchingApprover);
        // Force a rerender to make sure UI reflects the selection
        setForceUpdate((prev) => prev + 1);
      }
    }
  }, [selectedUserId, approvers]);

  useEffect(() => {
    if (selectedGroupId) {
      const matchingGroup = groups.find((g) => g.id === selectedGroupId);
      if (matchingGroup) {
        setSelectedGroup(matchingGroup);
        setIsGroupMembersExpanded(false); // Reset expansion state when group changes
        // Force a rerender to make sure UI reflects the selection
        setForceUpdate((prev) => prev + 1);
      }
    }
  }, [selectedGroupId, groups]);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Fetch approvers and groups in parallel for better performance
      const [approversResponse, groupsResponse] = await Promise.allSettled([
        approvalService.getAllApprovators(),
        approvalService.getAllApprovalGroups(),
      ]);

      // Handle approvers response
      if (approversResponse.status === "fulfilled") {
        const fetchedApprovators = Array.isArray(approversResponse.value)
          ? approversResponse.value
          : [];

        console.log("Fetched approvators:", fetchedApprovators);

        if (fetchedApprovators.length === 0) {
          console.warn("No approvators returned from API");
        }

        // Transform Approvator to ApproverInfo for compatibility
        const approversInfo: ApproverInfo[] = fetchedApprovators.map(approvator => ({
          id: approvator.id,
          userId: approvator.userId,
          username: approvator.username,
          role: undefined, // Role not included in Approvator response
        }));

        setApprovers(approversInfo);

        // If we have a selected userId, find and select the approver now
        if (selectedUserId) {
          const approver = approversInfo.find(
            (a) => a.userId === selectedUserId
          );
          if (approver) {
            setSelectedApprover(approver);
            // Manually set HTML content for approver selection
            updateApproverSelectUI(approver);
          }
        }
      } else {
        console.error("Failed to fetch approvers:", approversResponse.reason);
        toast.error("Failed to load approvers");
      }

      // Handle groups response
      if (groupsResponse.status === "fulfilled") {
        const fetchedGroups = Array.isArray(groupsResponse.value)
          ? groupsResponse.value
          : [];

        console.log("Fetched groups:", fetchedGroups);

        if (fetchedGroups.length === 0) {
          console.warn("No groups returned from API");
        }

        // Safely type cast the group's ruleType to ApprovalRuleType
        const typedGroups = fetchedGroups.map((group) => ({
          ...group,
          ruleType: (group.ruleType as ApprovalRuleType) || "All",
        }));

        setGroups(
          typedGroups.filter(
            (group) =>
              group &&
              typeof group === "object" &&
              "id" in group &&
              "name" in group
          )
        );

        // If we have a selected groupId, find and select the group now
        if (selectedGroupId) {
          const group = fetchedGroups.find((g) => g.id === selectedGroupId);
          if (group) {
            const typedGroup = {
              ...group,
              ruleType: (group.ruleType as ApprovalRuleType) || "All",
            };
            setSelectedGroup(typedGroup);
            setIsGroupMembersExpanded(false); // Reset expansion state when group changes
            // Manually set HTML content for group selection
            updateGroupSelectUI(typedGroup);
          }
        }
      } else {
        console.error("Failed to fetch groups:", groupsResponse.reason);
        toast.error("Failed to load approval groups");
      }
    } catch (error) {
      console.error("Failed to fetch approver data:", error);
      setLoadError("Failed to load approvers and groups. Please try again.");
      // Set empty arrays as fallback
      setApprovers([]);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update approver select UI
  const updateApproverSelectUI = (approver: ApproverInfo) => {
    if (approverSelectRef.current) {
      try {
        const span = approverSelectRef.current.querySelector("span");
        if (span) {
          span.textContent = approver.username || "Selected Approver";
          span.className = "truncate"; // Restore the truncate class
        }
      } catch (e) {
        console.error("Failed to update approver select UI", e);
      }
    }
  };

  // Helper function to update group select UI
  const updateGroupSelectUI = (group: ApprovalGroup) => {
    if (groupSelectRef.current) {
      try {
        const span = groupSelectRef.current.querySelector("span");
        if (span) {
          span.textContent = group.name || "Selected Group";
          span.className = "truncate"; // Restore the truncate class
        }
      } catch (e) {
        console.error("Failed to update group select UI", e);
      }
    }
  };

  const handleApprovalTypeChange = (value: string) => {
    if (value !== "individual" && value !== "group") return;

    onApprovalTypeChange(value);
    // Reset the other selection when changing types
    if (value === "individual") {
      onGroupSelected(undefined);
    } else {
      onUserSelected(undefined);
    }
  };

  // Generate initials for user avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to handle user selection directly from data
  const handleDirectUserSelection = (userId: number) => {
    const approver = approvers.find((a) => a.userId === userId);
    if (approver) {
      setSelectedApprover(approver);
      updateApproverSelectUI(approver);
      onUserSelected(userId);
    }
  };

  // Helper function to handle group selection directly from data
  const handleDirectGroupSelection = (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setIsGroupMembersExpanded(false); // Reset expansion state when group changes
      updateGroupSelectUI(group);
      onGroupSelected(groupId);
    }
  };

  if (loadError) {
    return (
      <Alert
        variant="destructive"
        className="bg-red-900/20 border-red-900/30 text-red-300"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{loadError}</AlertDescription>
        <button
          className="ml-auto px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 rounded text-blue-300 text-sm flex items-center"
          onClick={() => fetchData()}
        >
          <RefreshCw className="h-3 w-3 mr-1" /> Retry
        </button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" key={forceUpdate}>
      <div className="space-y-2">
        <Label className="text-blue-200">Approval Type</Label>
        {isLoading ? (
          <Skeleton className="h-10 w-full bg-blue-950/40" />
        ) : (
          <RadioGroup
            value={approvalType}
            onValueChange={handleApprovalTypeChange}
            className="flex flex-col space-y-2"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="individual"
                id="individual"
                className="border-blue-500 text-blue-500"
                disabled={disabled}
              />
              <Label
                htmlFor="individual"
                className={`flex items-center ${
                  approvalType === "individual"
                    ? "text-blue-200"
                    : "text-blue-300/70"
                } ${disabled ? "opacity-50" : ""}`}
              >
                <User className="mr-2 h-4 w-4 text-blue-400" />
                Individual User Approval
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="group"
                id="group"
                className="border-blue-500 text-blue-500"
                disabled={disabled}
              />
              <Label
                htmlFor="group"
                className={`flex items-center ${
                  approvalType === "group"
                    ? "text-blue-200"
                    : "text-blue-300/70"
                } ${disabled ? "opacity-50" : ""}`}
              >
                <Users className="mr-2 h-4 w-4 text-blue-400" />
                Group Approval
              </Label>
            </div>
          </RadioGroup>
        )}
      </div>

      {approvalType === "individual" ? (
        <div className="space-y-2">
          <Label htmlFor="approver" className="text-blue-200">
            Select Approver
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full bg-blue-950/40" />
          ) : (
            <>
              {approvers.length > 0 ? (
                <>
                  {/* Main approver selection */}
                  <select
                    className="w-full bg-[#0d1541]/70 border border-blue-900/50 text-white rounded p-2 text-sm"
                    value={selectedUserId?.toString() || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        handleDirectUserSelection(parseInt(val, 10));
                      }
                    }}
                    disabled={disabled}
                  >
                    <option value="">Select an approver</option>
                    {approvers.map((a) => (
                      <option key={a.userId} value={a.userId}>
                        {a.username}
                      </option>
                    ))}
                  </select>

                  {/* Selected approver display */}
                  {selectedApprover && (
                    <div className="mt-2 p-2 bg-blue-900/20 border border-blue-900/30 rounded-md flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-700/50 flex items-center justify-center text-xs font-medium text-blue-200 mr-3">
                        {getInitials(selectedApprover.username)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-200">
                          {selectedApprover.username}
                        </div>
                        {selectedApprover.role && (
                          <div className="text-xs text-blue-300/70">
                            {selectedApprover.role}
                          </div>
                        )}
                      </div>
                      <UserCheck className="ml-auto h-4 w-4 text-green-400" />
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-2 p-2 bg-amber-900/20 border border-amber-900/30 rounded-md text-xs text-amber-300">
                  No eligible approvers found. Please make sure users have been
                  assigned approver permissions.
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="group" className="text-blue-200">
            Select Approval Group
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full bg-blue-950/40" />
          ) : (
            <>
              {groups.length > 0 ? (
                <>
                  {/* Main approval group selection */}
                  <select
                    className="w-full bg-[#0d1541]/70 border border-blue-900/50 text-white rounded p-2 text-sm"
                    value={selectedGroupId?.toString() || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        handleDirectGroupSelection(parseInt(val, 10));
                      }
                    }}
                    disabled={disabled}
                  >
                    <option value="">Select an approval group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>

                  {/* Selected group display */}
                  {selectedGroup && (
                    <div className="mt-2 p-2 bg-blue-900/20 border border-blue-900/30 rounded-md">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-700/50 flex items-center justify-center text-xs font-medium text-purple-200 mr-3">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-200">
                            {selectedGroup.name}
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-900/30 text-blue-300 border-blue-900/50"
                            >
                              {selectedGroup.ruleType} approval
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs ml-2 bg-blue-900/30 text-blue-300 border-blue-900/50"
                            >
                              {selectedGroup.approvers?.length || 0} member
                              {selectedGroup.approvers?.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                        <Shield className="ml-auto h-4 w-4 text-purple-400" />
                      </div>

                      {/* Group members preview */}
                      {selectedGroup.approvers &&
                        selectedGroup.approvers.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-blue-900/30">
                            <div className="text-xs text-blue-300/70 mb-1">
                              {selectedGroup.ruleType === 'Sequential' ? 'Approval sequence:' : 'Group members:'}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(isGroupMembersExpanded 
                                ? selectedGroup.approvers 
                                : selectedGroup.approvers.slice(0, 3)
                              ).map((approver, index) => (
                                <Badge
                                  key={approver.userId}
                                  variant="secondary"
                                  className={`${
                                    selectedGroup.ruleType === 'Sequential'
                                      ? "bg-purple-900/40 text-purple-200 border border-purple-800/50"
                                      : "bg-blue-900/40 text-blue-200"
                                  }`}
                                >
                                  {selectedGroup.ruleType === 'Sequential' && (
                                    <span className="mr-1 text-xs font-mono">
                                      {(approver.orderIndex ?? index) + 1}.
                                    </span>
                                  )}
                                  {approver.username}
                                </Badge>
                              ))}
                              {selectedGroup.approvers.length > 3 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsGroupMembersExpanded(!isGroupMembersExpanded);
                                  }}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${
                                    selectedGroup.ruleType === 'Sequential'
                                      ? "bg-purple-900/40 text-purple-200 border border-purple-800/50 hover:bg-purple-900/60"
                                      : "bg-blue-900/40 text-blue-200 border hover:bg-blue-900/60"
                                  }`}
                                >
                                  {isGroupMembersExpanded 
                                    ? "Show less" 
                                    : `+${selectedGroup.approvers.length - 3} more`
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-2 p-2 bg-amber-900/20 border border-amber-900/30 rounded-md text-xs text-amber-300">
                  No approval groups found. Please create approval groups first.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
