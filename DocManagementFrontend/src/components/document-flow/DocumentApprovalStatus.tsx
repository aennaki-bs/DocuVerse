import { useState, useEffect } from "react";
import { useDocumentApproval } from "@/hooks/document-workflow/useDocumentApproval";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
  User,
  UserCheck,
  Users,
  Shield,
  Check,
  X,
  ArrowRight,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ApproverInfo, StepApprovalConfigDetailDto, ApprovalHistory, PendingApproval } from "@/models/approval";
import approvalService from "@/services/approvalService";
import { useAuth } from "@/context/AuthContext";

interface DocumentApprovalStatusProps {
  documentId: number;
  onApprovalUpdate?: () => void;
  refreshTrigger?: number;
  showApprovalHistory?: boolean;
  onToggleApprovalHistory?: () => void;
}

export function DocumentApprovalStatus({
  documentId,
  onApprovalUpdate,
  refreshTrigger,
  showApprovalHistory,
  onToggleApprovalHistory,
}: DocumentApprovalStatusProps) {
  const { user } = useAuth();

  const {
    approvalHistory,
    isHistoryLoading,
    isHistoryError,
    hasPendingApprovals,
    latestApprovalStatus,
    wasRejected,
    refetchHistory,
  } = useDocumentApproval(documentId);

  // Also fetch pending approvals for this document to get assignment info
  const { data: pendingApprovals } = useQuery<PendingApproval[]>({
    queryKey: ['documentApprovals', documentId],
    queryFn: () => approvalService.getDocumentApprovals(documentId),
    enabled: !!documentId && hasPendingApprovals,
    refetchInterval: hasPendingApprovals ? 30000 : false, // Refetch every 30s if pending
  });

  // Get the latest pending approval from approval history
  const latestPendingApproval = approvalHistory && Array.isArray(approvalHistory) ? 
    approvalHistory.find((approval: ApprovalHistory) => {
      const status = approval.status?.toLowerCase();
      return status === 'open' || status === 'inprogress' || status === 'pending';
    }) : undefined;

  // Get assignment information from pending approvals (this has the stepId)
  const latestPendingAssignment = pendingApprovals?.[0];

  // Use stepId from pending assignment, not from approval history (which doesn't have stepId)
  const stepIdForConfig = latestPendingAssignment?.stepId;

  // Fetch step configuration when we have a pending approval
  const { data: stepConfig } = useQuery<StepApprovalConfigDetailDto>({
    queryKey: ['stepConfig', stepIdForConfig],
    queryFn: () => approvalService.getStepApprovalConfig(stepIdForConfig!),
    enabled: !!stepIdForConfig,
  });

  // Helper function to get approval status for a specific user
  const getUserApprovalStatus = (username: string) => {
    if (!approvalHistory || !Array.isArray(approvalHistory) || !latestPendingAssignment) return null;

    // Find the current approval in the history
    const currentApproval = approvalHistory.find(
      (item: ApprovalHistory) => item.approvalId === latestPendingAssignment.approvalId
    );

    if (!currentApproval || !currentApproval.responses) return null;

    // Find this user's response
    const userResponse = currentApproval.responses.find(
      response => response.responderName === username
    );

    return userResponse;
  };

  // Refetch approval data when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refetchHistory();
    }
  }, [refreshTrigger, refetchHistory]);

  const getStatusBadge = () => {
    if (isHistoryLoading) {
      return <Badge className="bg-blue-600">Loading...</Badge>;
    }

    if (wasRejected) {
      return <Badge className="bg-red-600">Rejected</Badge>;
    }

    if (hasPendingApprovals) {
      return <Badge className="bg-amber-500">Pending Approval</Badge>;
    }

    if (latestApprovalStatus?.toLowerCase().includes("approved")) {
      return <Badge className="bg-green-600">Approved</Badge>;
    }

    return <Badge className="bg-blue-600">No Approval Required</Badge>;
  };

  // Get rule type badge
  const getRuleTypeBadge = (ruleType: string) => {
    if (!ruleType) {
      return (
        <Badge variant="outline" className="border-amber-500/30 text-amber-200">
          Group
        </Badge>
      );
    }

    switch (ruleType.toLowerCase()) {
      case 'sequential':
        return (
          <Badge variant="outline" className="border-purple-500/30 text-purple-200 bg-purple-500/10">
            Sequential
          </Badge>
        );
      case 'all':
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-200 bg-blue-500/10">
            All Approvers Required
          </Badge>
        );
      case 'any':
        return (
          <Badge variant="outline" className="border-green-500/30 text-green-200 bg-green-500/10">
            Any Approver
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-200">
            {ruleType}
          </Badge>
        );
    }
  };

  if (isHistoryLoading) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isHistoryError) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2 text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Failed to load approval status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!approvalHistory || !Array.isArray(approvalHistory) || approvalHistory.length === 0) {
    return (
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2 text-gray-400">
            <p>No approval required for this document</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white">Approval Status</CardTitle>
            {onToggleApprovalHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleApprovalHistory}
                className="flex items-center gap-2 bg-blue-950/40 border-blue-900/30 text-blue-300 hover:bg-blue-900/40 hover:text-blue-200"
              >
                <History className="h-4 w-4" />
                {showApprovalHistory ? (
                  <>
                    Hide History
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show History
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {wasRejected ? (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                ) : hasPendingApprovals ? (
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                )}
                <span className="text-white">
                  {wasRejected
                    ? "Approval Rejected"
                    : hasPendingApprovals
                    ? "Waiting for Approval"
                    : "Approval Complete"}
                </span>
              </div>
              {getStatusBadge()}
            </div>

            {/* Show detailed waiting approval information */}
            {hasPendingApprovals && latestPendingAssignment && (
              <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-amber-400/70" />
                    <span className="text-amber-200/80">Status:</span> 
                    <span className="text-amber-100">
                      {latestPendingAssignment.status || "Pending"}
                    </span>
                  </div>
                  
                  {stepConfig && (
                    <>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-amber-400/70" />
                        <span className="text-amber-200/80">Step:</span> 
                        <span className="text-amber-100">{stepConfig.stepKey}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm pl-5">
                        <span className="text-amber-300">Moving from</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-200">
                          {stepConfig.currentStatusTitle}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-amber-300" />
                        <span className="text-amber-300">to</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-200">
                          {stepConfig.nextStatusTitle}
                        </Badge>
                      </div>
                    </>
                  )}
                  
                  {latestPendingAssignment.requestedBy && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-amber-400/70" />
                      <span className="text-amber-200/80">Requested by:</span> 
                      <span className="text-amber-100">{latestPendingAssignment.requestedBy}</span>
                    </div>
                  )}
                  
                  {/* Display individual approver */}
                  {stepConfig?.approvalType === "Single" && stepConfig.singleApproverName && (
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4 text-amber-400/70" />
                      <span className="text-amber-200/80">Waiting for:</span> 
                      <span className="text-amber-100">{stepConfig.singleApproverName}</span>
                    </div>
                  )}
                  
                  {/* Display approver group */}
                  {stepConfig?.approvalType === "Group" && stepConfig.groupName && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-amber-400/70" />
                        <span className="text-amber-200/80">Approvers Group:</span> 
                        <span className="text-amber-100">{stepConfig.groupName.replace(/\s*\(ID:\s*\d+\)/, '')}</span>
                      </div>
                      
                      {stepConfig.ruleType && (
                        <div className="flex items-center gap-1 mb-1">
                          <Shield className="h-4 w-4 text-amber-400/70" />
                          <span className="text-amber-200/80">Approval Rule:</span> 
                          {getRuleTypeBadge(stepConfig.ruleType)}
                        </div>
                      )}
                      
                      {stepConfig.groupApprovers && stepConfig.groupApprovers.length > 0 && (
                        <div className="mt-1">
                          <p className="text-amber-200/80 mb-2">Group Members:</p>
                          <div className="space-y-1 pl-5">
                            {stepConfig.groupApprovers.map((member, index) => {
                              const userStatus = getUserApprovalStatus(member.username);
                              const hasApproved = userStatus?.isApproved === true;
                              const hasRejected = userStatus?.isApproved === false;
                              const hasPending = !userStatus;
                              
                              return (
                                <div key={member.userId || index} className="flex items-center gap-2">
                                  {stepConfig.ruleType?.toLowerCase() === 'sequential' && (
                                    <span className="text-amber-400/70 text-xs">{index + 1}.</span>
                                  )}
                                  
                                  {/* Status icon */}
                                  {hasApproved ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                  ) : hasRejected ? (
                                    <X className="h-4 w-4 text-red-400" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-amber-400/70" />
                                  )}
                                  
                                  {/* User name */}
                                  <span className={`${
                                    hasApproved ? 'text-green-200' : 
                                    hasRejected ? 'text-red-200' : 
                                    'text-amber-100'
                                  }`}>
                                    {member.username}
                                  </span>
                                  
                                  {/* Status badge */}
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      hasApproved ? 'border-green-500/30 text-green-200 bg-green-500/10' :
                                      hasRejected ? 'border-red-500/30 text-red-200 bg-red-500/10' :
                                      'border-amber-500/30 text-amber-200 bg-amber-500/10'
                                    }`}
                                  >
                                    {hasApproved ? 'Approved' : hasRejected ? 'Rejected' : 'Pending'}
                                  </Badge>
                                  
                                  {/* Response date */}
                                  {userStatus && (
                                    <span className="text-xs text-amber-200/50">
                                      {new Date(userStatus.responseDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {latestPendingAssignment.requestDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-amber-400/70" />
                      <span className="text-amber-200/80">Waiting since:</span> 
                      <span className="text-amber-100">
                        {new Date(latestPendingAssignment.requestDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {wasRejected && (
              <div className="rounded-md bg-red-900/20 p-3 border border-red-800/50">
                <p className="text-sm text-red-300">
                  This document was rejected. Please review the approval history
                  for details.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
