import { useState, useEffect } from 'react';
import { 
  AlertCircle, Clock8, User, UserCheck, Users, Loader2, 
  Clock, Shield, CheckCircle2, XCircle, Calendar, Check, X, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ApprovalHistoryItem, ApproversGroup } from '@/services/approvalService';
import { ApproverInfo, StepApprovalConfigDetailDto } from '@/models/approval';
import approvalService from '@/services/approvalService';
import { useQuery } from '@tanstack/react-query';

interface DocumentApprovalDetailsProps {
  pendingApproval?: ApprovalHistoryItem;
  approvalHistory?: ApprovalHistoryItem[];
  isLoadingApproval?: boolean;
}

const DocumentApprovalDetails = ({ 
  pendingApproval, 
  approvalHistory, 
  isLoadingApproval 
}: DocumentApprovalDetailsProps) => {
  const [groupDetails, setGroupDetails] = useState<ApproversGroup | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [groupMembers, setGroupMembers] = useState<ApproverInfo[]>([]);

  // Fetch step configuration when we have a pending approval
  const { data: stepConfig } = useQuery<StepApprovalConfigDetailDto>({
    queryKey: ['stepConfig', pendingApproval?.stepId],
    queryFn: () => approvalService.getStepApprovalConfig(pendingApproval!.stepId),
    enabled: !!pendingApproval?.stepId,
  });

  // Get approval group details if this is a group approval
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!pendingApproval || !pendingApproval.assignedToGroup) return;

      try {
        setIsLoadingGroup(true);
        // Extract group ID from the group name if available, or try to parse from response data
        const groupMatch = pendingApproval.assignedToGroup.match(/\(ID: (\d+)\)/);
        const groupId = groupMatch ? parseInt(groupMatch[1], 10) : null;

        if (groupId) {
          const groupData = await approvalService.getApprovalGroup(groupId);
          setGroupDetails(groupData);

          // Fetch group members
          const membersData = await approvalService.getGroupMembers(groupId);
          setGroupMembers(membersData);
        }
      } catch (error) {
        console.error('Error fetching approval group details:', error);
      } finally {
        setIsLoadingGroup(false);
      }
    };

    fetchGroupDetails();
  }, [pendingApproval]);

  // Helper function to get approval status for a specific user
  const getUserApprovalStatus = (username: string) => {
    if (!approvalHistory || !pendingApproval) return null;

    // Find the current approval in the history
    const currentApproval = approvalHistory.find(
      item => item.approvalId === pendingApproval.approvalId
    );

    if (!currentApproval || !currentApproval.responses) return null;

    // Find this user's response
    const userResponse = currentApproval.responses.find(
      response => response.responderName === username
    );

    return userResponse;
  };

  if (isLoadingApproval) {
    return (
      <div className="mb-6 p-3 bg-blue-900/20 border border-blue-800/30 rounded-md flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span>Loading approval information...</span>
      </div>
    );
  }

  if (!pendingApproval) return null;

  // Check if this is a synthetic approval that doesn't actually require action
  // (created just for display purposes with assignedTo="Approval Required")
  if (pendingApproval.assignedTo === "Approval Required" && !pendingApproval.assignedToGroup) {
    return (
      <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
        <div className="flex items-center gap-2 text-blue-300 mb-2">
          <CheckCircle2 className="h-5 w-5" />
          <h3 className="font-medium">No Required Approval</h3>
        </div>
        
        <div className="pl-7 space-y-1 text-sm">
          {stepConfig && (
            <>
              <p className="flex items-center gap-1">
                <Clock8 className="h-4 w-4 text-blue-400/70" />
                <span className="text-blue-200/80">Step:</span> 
                <span className="text-blue-100">{stepConfig.stepKey}</span>
              </p>
              <div className="flex items-center gap-2 text-sm pl-5">
                <span className="text-blue-300">Moving from</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-200">
                  {stepConfig.currentStatusTitle}
                </Badge>
                <ArrowRight className="h-4 w-4 text-blue-300" />
                <span className="text-blue-300">to</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-200">
                  {stepConfig.nextStatusTitle}
                </Badge>
              </div>
            </>
          )}
          <p className="text-blue-200/80">
            This step does not require any approval action at this time.
          </p>
        </div>
      </div>
    );
  }

  // Format approval status for display
  const getStatusBadge = (status: string) => {
    let className = "border-amber-500/30 text-amber-200";
    let displayStatus = status || "Pending";

    // Safely check status with null/undefined check
    if (!status) {
      return (
        <Badge variant="outline" className={className}>
          Pending
        </Badge>
      );
    }

    // Match to known status values
    if (status.toLowerCase() === "open" || status.toLowerCase() === "inprogress" || status.toLowerCase() === "waiting" || status.toLowerCase().includes("progress")) {
      className = "border-blue-500/30 text-blue-200 bg-blue-500/10";
      displayStatus = "In Progress";
    } else if (status.toLowerCase() === "accepted" || status.toLowerCase().includes("accept") || status.toLowerCase().includes("complete")) {
      className = "border-green-500/30 text-green-200 bg-green-500/10";
      displayStatus = "Approved";
    } else if (status.toLowerCase() === "rejected" || status.toLowerCase().includes("reject")) {
      className = "border-red-500/30 text-red-200 bg-red-500/10";
      displayStatus = "Rejected";
    }

    return (
      <Badge variant="outline" className={className}>
        {displayStatus}
      </Badge>
    );
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

  return (
    <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
      <div className="flex items-center gap-2 text-amber-300 mb-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-medium">Waiting for Approval</h3>
      </div>
      
      <div className="pl-7 space-y-1 text-sm">
        <p className="flex items-center gap-1">
          <Clock8 className="h-4 w-4 text-amber-400/70" />
          <span className="text-amber-200/80">Status:</span> 
          <span className="text-amber-100">
            {pendingApproval.status || "Pending"}
          </span>
        </p>
        
        {stepConfig && (
          <>
            <p className="flex items-center gap-1">
              <Clock8 className="h-4 w-4 text-amber-400/70" />
              <span className="text-amber-200/80">Step:</span> 
              <span className="text-amber-100">{stepConfig.stepKey}</span>
            </p>
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
        
        {pendingApproval.processedBy && (
          <p className="flex items-center gap-1">
            <User className="h-4 w-4 text-amber-400/70" />
            <span className="text-amber-200/80">Processed by:</span> 
            <span className="text-amber-100">{pendingApproval.processedBy}</span>
          </p>
        )}
        
        {pendingApproval.assignedTo && !pendingApproval.assignedToGroup && (
          <p className="flex items-center gap-1">
            <UserCheck className="h-4 w-4 text-amber-400/70" />
            <span className="text-amber-200/80">Waiting for:</span> 
            <span className="text-amber-100">{pendingApproval.assignedTo}</span>
          </p>
        )}
        
        {pendingApproval.assignedToGroup && (
          <>
            <p className="flex items-center gap-1">
              <Users className="h-4 w-4 text-amber-400/70" />
              <span className="text-amber-200/80">Approvers Group:</span> 
              <span className="text-amber-100">{pendingApproval.assignedToGroup?.replace(/\s*\(ID:\s*\d+\)/, '')}</span>
            </p>
            
            {isLoadingGroup ? (
              <p className="flex items-center gap-1 text-amber-200/50 pl-5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading group details...
              </p>
            ) : groupDetails && (
              <div className="pl-5 mt-2 mb-2">
                {groupDetails.ruleType && (
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="h-4 w-4 text-amber-400/70" />
                    <span className="text-amber-200/80">Approval Rule:</span> 
                    {getRuleTypeBadge(groupDetails.ruleType)}
                  </div>
                )}
                
                {groupMembers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-amber-200/80 mb-2">Group Members:</p>
                    <div className="space-y-2 pl-5">
                      {groupMembers.map((member, index) => {
                        const userStatus = getUserApprovalStatus(member.username);
                        const hasApproved = userStatus?.isApproved === true;
                        const hasRejected = userStatus?.isApproved === false;
                        const hasPending = !userStatus;
                        
                        return (
                          <div key={member.userId} className="flex items-center gap-2">
                            {groupDetails.ruleType && groupDetails.ruleType.toLowerCase() === 'sequential' && (
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
                              {member.username || 'Unknown'}
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
          </>
        )}
        
        {pendingApproval.createdAt && (
          <p className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-amber-400/70" />
            <span className="text-amber-200/80">Waiting since:</span> 
            <span className="text-amber-100">
              {new Date(pendingApproval.createdAt).toLocaleString()}
            </span>
          </p>
        )}
        

      </div>
      
      {/* If there's approval history, show recent actions */}
      {approvalHistory && approvalHistory.length > 1 && (
        <div className="mt-4 pt-3 border-t border-amber-500/20">
          <p className="text-amber-300 font-medium mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Recent Approval Actions
          </p>
          
          <div className="space-y-2 pl-7">
            {approvalHistory
              .filter(item => item.approvalId !== pendingApproval.approvalId)
              .slice(0, 3)
              .map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-1">
                    {item.status && item.status.toLowerCase().includes('accept') ? (
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                    ) : item.status && item.status.toLowerCase().includes('reject') ? (
                      <XCircle className="h-3 w-3 text-red-400" />
                    ) : (
                      <Clock className="h-3 w-3 text-amber-400/70" />
                    )}
                    <span className="text-amber-200/80">{item.stepTitle || 'Step'}:</span>
                    <span className="text-amber-100">{item.status || 'Unknown'}</span>
                    <span className="text-amber-200/50 text-xs">
                      {item.processedBy && `by ${item.processedBy}`}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentApprovalDetails; 