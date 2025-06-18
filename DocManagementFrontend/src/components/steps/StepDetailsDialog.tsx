import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Users,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  AlertCircle,
  FileText,
  Settings,
} from "lucide-react";
import { Step } from "@/models/step";
import approvalService from "@/services/approvalService";
import api from "@/services/api/core";

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Step | null;
}

interface StepApprovalConfig {
  requiresApproval: boolean;
  approvalType?: string;
  singleApproverId?: number;
  singleApproverName?: string;
  approvatorsGroupId?: number;
  groupName?: string;
  groupApprovers?: { userId: number; username: string; orderIndex: number }[];
  ruleType?: string;
  comment?: string;
}

interface StatusInfo {
  statusId: number;
  title: string;
  description?: string;
  isInitial: boolean;
  isFinal: boolean;
}

export const StepDetailsDialog = ({
  open,
  onOpenChange,
  step,
}: StepDetailsDialogProps) => {
  const [approvalConfig, setApprovalConfig] = useState<StepApprovalConfig | null>(null);
  const [currentStatus, setCurrentStatus] = useState<StatusInfo | null>(null);
  const [nextStatus, setNextStatus] = useState<StatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStepDetails = async () => {
      if (!step || !open) {
        setApprovalConfig(null);
        setCurrentStatus(null);
        setNextStatus(null);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch approval configuration if step requires approval
        if (step.requiresApproval) {
          try {
            const config = await approvalService.getStepApprovalConfig(step.id);
            setApprovalConfig(config);
          } catch (err) {
            console.error("Error fetching approval config:", err);
            setApprovalConfig({ requiresApproval: false });
          }
        } else {
          setApprovalConfig({ requiresApproval: false });
        }

        // Fetch status information
        const [currentStatusResponse, nextStatusResponse] = await Promise.allSettled([
          api.get(`/Status/${step.currentStatusId}`),
          api.get(`/Status/${step.nextStatusId}`),
        ]);

        if (currentStatusResponse.status === "fulfilled") {
          setCurrentStatus(currentStatusResponse.value.data);
        }

        if (nextStatusResponse.status === "fulfilled") {
          setNextStatus(nextStatusResponse.value.data);
        }
      } catch (err) {
        console.error("Error fetching step details:", err);
        setError("Failed to load step details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStepDetails();
  }, [step, open]);

  const renderApprovalDetails = () => {
    if (!approvalConfig?.requiresApproval) {
      return (
        <div className="flex items-center text-gray-400">
          <XCircle className="h-4 w-4 mr-2" />
          No approval required
        </div>
      );
    }

    if (approvalConfig.approvalType === "Single" && approvalConfig.singleApproverName) {
      return (
        <div className="space-y-2">
          <div className="flex items-center text-green-400">
            <CheckCircle className="h-4 w-4 mr-2" />
            Individual Approval Required
          </div>
          <Card className="border-blue-900/30 bg-blue-900/10">
            <CardContent className="p-3">
              <div className="flex items-center">
                <User className="h-4 w-4 text-blue-400 mr-2" />
                <span className="font-medium text-blue-200">
                  {approvalConfig.singleApproverName}
                </span>
              </div>
              {approvalConfig.comment && (
                <div className="mt-2 text-xs text-gray-400">
                  <span className="font-medium">Comment:</span> {approvalConfig.comment}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (approvalConfig.approvalType === "Group" && approvalConfig.groupName) {
      return (
        <div className="space-y-2">
          <div className="flex items-center text-green-400">
            <CheckCircle className="h-4 w-4 mr-2" />
            Group Approval Required
          </div>
          <Card className="border-blue-900/30 bg-blue-900/10">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="font-medium text-blue-200">
                    {approvalConfig.groupName}
                  </span>
                </div>
                {approvalConfig.ruleType && (
                  <Badge variant="secondary" className="bg-blue-900/30 text-blue-300">
                    {approvalConfig.ruleType}
                  </Badge>
                )}
              </div>
              
              {approvalConfig.groupApprovers && approvalConfig.groupApprovers.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Group Members:</div>
                  <div className="space-y-1">
                    {approvalConfig.groupApprovers.map((approver) => (
                      <div key={approver.userId} className="flex items-center text-sm text-blue-300">
                        <User className="h-3 w-3 text-blue-400 mr-1" />
                        {approver.username}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {approvalConfig.comment && (
                <div className="mt-2 text-xs text-gray-400">
                  <span className="font-medium">Comment:</span> {approvalConfig.comment}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center text-amber-400">
        <AlertCircle className="h-4 w-4 mr-2" />
        Approval required but configuration not found
      </div>
    );
  };

  const renderStatusBadge = (status: StatusInfo | null, label: string) => {
    if (!status) {
      return (
        <div className="space-y-1">
          <div className="text-sm text-gray-400">{label}</div>
          <Badge variant="outline" className="text-gray-400 border-gray-600">
            Not Set
          </Badge>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-400">{label}</div>
        <Badge
          variant="outline"
          className={`${
            status.isInitial
              ? "bg-green-900/20 text-green-300 border-green-700"
              : status.isFinal
              ? "bg-purple-900/20 text-purple-300 border-purple-700"
              : "bg-blue-900/20 text-blue-300 border-blue-700"
          }`}
        >
          {status.title}
          {status.isInitial && " (Initial)"}
          {status.isFinal && " (Final)"}
        </Badge>
        {status.description && (
          <div className="text-xs text-gray-500 mt-1">{status.description}</div>
        )}
      </div>
    );
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-blue-900/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-100 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Step Details
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <Card className="border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-400 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">Title</div>
                <div className="text-white font-medium">{step.title}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Description</div>
                <div className="text-gray-300 text-sm whitespace-pre-wrap">
                  {step.descriptif || "No description provided"}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Step Code</div>
                  <div className="text-white text-sm">{step.stepKey || "Not set"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Order Index</div>
                  <div className="text-white text-sm">{step.orderIndex}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Final Step</div>
                <Badge variant={step.isFinalStep ? "default" : "secondary"}>
                  {step.isFinalStep ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Status Transition */}
          <Card className="border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-400 flex items-center">
                <ArrowRight className="h-4 w-4 mr-2" />
                Status Transition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-between">
                  <Skeleton className="h-12 w-32 bg-blue-900/30" />
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <Skeleton className="h-12 w-32 bg-blue-900/30" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {renderStatusBadge(currentStatus, "Current Status")}
                  <ArrowRight className="h-4 w-4 text-blue-500 mx-4" />
                  {renderStatusBadge(nextStatus, "Next Status")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Configuration */}
          <Card className="border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-400 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Approval Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 bg-blue-900/30" />
                  <Skeleton className="h-16 w-full bg-blue-900/30" />
                </div>
              ) : (
                renderApprovalDetails()
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 