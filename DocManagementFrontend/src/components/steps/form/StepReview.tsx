import { useStepForm } from "./StepFormProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Info,
  User,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api/core";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import approvalService from "@/services/approvalService";

// Define the status interface
interface Status {
  statusId: number;
  title: string;
  description?: string;
  isInitial: boolean;
  isFinal: boolean;
}

// Define interfaces for approval data
interface Approvator {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

interface ApprovalGroup {
  id: number;
  name: string;
  comment?: string;
  ruleType: string;
  approvers?: { userId: number; username: string }[];
}

export const StepReview = () => {
  const { formData, isEditMode, formErrors, registerStepForm } = useStepForm();
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [nextStatus, setNextStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState<Approvator | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(null);
  const [isLoadingApproval, setIsLoadingApproval] = useState(false);

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(4, {
      validate: async () => {
        return true; // Review step is just a summary, no validation needed
      },
      getValues: () => ({}),
    });
  }, [registerStepForm]);

  // Fetch approval details when form data changes
  useEffect(() => {
    const fetchApprovalDetails = async () => {
      if (!formData.requiresApproval) return;

      try {
        setIsLoadingApproval(true);

        if (formData.approvalType === "user" && formData.approvalUserId) {
          // Fetch all approvators to find the selected one
          const approvators = await approvalService.getAllApprovators();
          const approver = approvators.find(a => a.userId === formData.approvalUserId);
          setSelectedApprover(approver || null);
        } else if (formData.approvalType === "group" && formData.approvalGroupId) {
          // Fetch the specific group details
          const group = await approvalService.getApprovalGroup(formData.approvalGroupId);
          setSelectedGroup(group || null);
        }
      } catch (error) {
        console.error("Error fetching approval details:", error);
      } finally {
        setIsLoadingApproval(false);
      }
    };

    fetchApprovalDetails();
  }, [formData.approvalType, formData.approvalUserId, formData.approvalGroupId, formData.requiresApproval]);

  // Fetch status information for display
  useEffect(() => {
    const fetchStatusData = async () => {
      if (
        !formData.circuitId ||
        !formData.currentStatusId ||
        !formData.nextStatusId
      )
        return;

      try {
        setIsLoading(true);

        // Fetch current status
        const currentStatusResponse = await api.get(
          `/Status/${formData.currentStatusId}`
        );
        if (currentStatusResponse.data) {
          setCurrentStatus(currentStatusResponse.data);
        }

        // Fetch next status
        const nextStatusResponse = await api.get(
          `/Status/${formData.nextStatusId}`
        );
        if (nextStatusResponse.data) {
          setNextStatus(nextStatusResponse.data);
        }
      } catch (error) {
        console.error("Error fetching status information:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();
  }, [formData.circuitId, formData.currentStatusId, formData.nextStatusId]);

  // Get any errors for this step
  const stepErrors = formErrors[4] || [];
  const hasErrors = stepErrors.length > 0;

  const renderApprovalDetails = () => {
    if (!formData.requiresApproval) return null;

    return (
      <div className="mt-2 pt-2 border-t border-blue-900/30 space-y-2">
        <div className="text-xs text-gray-400 mb-1">
          Approval Method:
        </div>
        
        {formData.approvalType === "user" ? (
          <div className="space-y-1">
            <div className="flex items-center text-xs text-white">
              <User className="h-3 w-3 text-blue-400 mr-1" />
              Individual Approver
            </div>
            {isLoadingApproval ? (
              <Skeleton className="h-4 w-32 bg-blue-900/30" />
            ) : selectedApprover ? (
              <div className="ml-4 text-xs text-blue-200 bg-[#0a1033]/50 p-1.5 rounded border border-blue-900/30">
                <div className="flex items-center">
                  <User className="h-3 w-3 text-blue-400 mr-1" />
                  <span className="font-medium">{selectedApprover.username}</span>
                </div>
              </div>
            ) : (
              <div className="ml-4 text-xs text-amber-400">
                Approver details not found
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center text-xs text-white">
              <Users className="h-3 w-3 text-blue-400 mr-1" />
              Group Approval
            </div>
            {isLoadingApproval ? (
              <Skeleton className="h-4 w-32 bg-blue-900/30" />
            ) : selectedGroup ? (
              <div className="ml-4 space-y-2">
                <div className="text-xs text-blue-200 bg-[#0a1033]/50 p-1.5 rounded border border-blue-900/30">
                  <div className="flex items-center mb-1">
                    <Users className="h-3 w-3 text-blue-400 mr-1" />
                    <span className="font-medium">{selectedGroup.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs bg-blue-900/30 text-blue-300">
                      {selectedGroup.ruleType}
                    </Badge>
                  </div>
                  {selectedGroup.approvers && selectedGroup.approvers.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-blue-900/20">
                      <div className="text-xs text-gray-400 mb-1">Members:</div>
                      <div className="space-y-0.5">
                        {selectedGroup.approvers.slice(0, 3).map((approver) => (
                          <div key={approver.userId} className="flex items-center text-xs text-blue-300">
                            <User className="h-2.5 w-2.5 text-blue-400 mr-1" />
                            {approver.username}
                          </div>
                        ))}
                        {selectedGroup.approvers.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{selectedGroup.approvers.length - 3} more members
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="ml-4 text-xs text-amber-400">
                Group details not found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {hasErrors && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900/50 text-red-400 py-2 px-3"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {stepErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md overflow-hidden rounded-lg">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-medium text-blue-400 mb-1.5 flex items-center">
                <Info className="h-3 w-3 mr-1 text-blue-500" />
                Review Step Information
              </h3>

              <div className="rounded-lg bg-[#0d1541]/70 p-2 border border-blue-900/30 mb-2 space-y-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-blue-300">Title</div>
                  <div className="text-white text-xs bg-[#131d5a]/70 p-1.5 rounded-md border border-blue-900/20">
                    {formData.title}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-blue-300">
                    Description
                  </div>
                  <div className="text-gray-300 text-xs whitespace-pre-wrap bg-[#131d5a]/70 p-1.5 rounded-md border border-blue-900/20 min-h-[40px] max-h-[80px] overflow-y-auto">
                    {formData.descriptif || "No description provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Transition section */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-blue-300 mb-1">
                Status Transition
              </div>
              <div className="bg-[#131d5a]/70 p-2 rounded-md border border-blue-900/20">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full bg-blue-900/30" />
                    <Skeleton className="h-5 w-full bg-blue-900/30" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Badge
                        className={`px-2 py-0.5 text-xs ${
                          currentStatus?.isInitial
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {currentStatus?.title || "Unknown Status"}
                        {currentStatus?.isInitial && " (Initial)"}
                      </Badge>
                      <div className="text-gray-400 text-xs mt-1 ml-0.5">
                        Current Status
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-blue-500 mx-2" />

                    <div className="flex-1 text-right">
                      <Badge
                        className={`px-2 py-0.5 text-xs ${
                          nextStatus?.isFinal
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {nextStatus?.title || "Unknown Status"}
                        {nextStatus?.isFinal && " (Final)"}
                      </Badge>
                      <div className="text-gray-400 text-xs mt-1 mr-0.5">
                        Next Status
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Requirements section */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-blue-300 mb-1">
                Approval Requirements
              </div>
              <div className="bg-[#131d5a]/70 p-2 rounded-md border border-blue-900/20">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {formData.requiresApproval ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                      ) : (
                        <Info className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                      )}
                      <span className="text-xs text-white">
                        {formData.requiresApproval
                          ? "Requires Approval"
                          : "No Approval Required"}
                      </span>
                    </div>
                  </div>
                </div>

                {renderApprovalDetails()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
