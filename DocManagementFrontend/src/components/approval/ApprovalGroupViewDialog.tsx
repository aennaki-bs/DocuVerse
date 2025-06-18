import React from "react";
import { ApprovalGroup } from "@/models/approval";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersRound,
  UserRound,
  AlertTriangle,
  Info,
  Users,
  ArrowDownUp,
  ListOrdered,
  ArrowDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApprovalGroupViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ApprovalGroup;
  isAssociated?: boolean;
}

export default function ApprovalGroupViewDialog({
  open,
  onOpenChange,
  group,
  isAssociated = false,
}: ApprovalGroupViewDialogProps) {
  const isSequential = group.ruleType === "Sequential";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100 max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-blue-100 flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-blue-400" />
            Group Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Group header with name and rule type */}
          <div className="flex items-center justify-between bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
            <div className="flex items-center gap-3">
              <div
                className={`${
                  isSequential ? "bg-purple-800/60" : "bg-blue-800/60"
                } p-3 rounded-full`}
              >
                {isSequential ? (
                  <ListOrdered className="h-6 w-6 text-purple-300" />
                ) : (
                  <UsersRound className="h-6 w-6 text-blue-300" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-100">
                  {group.name}
                </h3>
                {group.comment && (
                  <p className="text-blue-300 text-sm mt-1">{group.comment}</p>
                )}
              </div>
            </div>
            <Badge
              className={`${
                group.ruleType === "All"
                  ? "bg-emerald-600/60 text-emerald-100"
                  : group.ruleType === "Any"
                  ? "bg-amber-600/60 text-amber-100"
                  : "bg-purple-600/60 text-purple-100"
              } px-3 py-1`}
            >
              {group.ruleType === "All"
                ? "All Must Approve"
                : group.ruleType === "Any"
                ? "Any Can Approve"
                : "Sequential Approval"}
            </Badge>
          </div>

          {/* Association warning */}
          {isAssociated && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 text-sm font-medium">
                  This group is currently associated with workflow steps
                </p>
                <p className="text-amber-200/70 text-xs mt-1">
                  You cannot edit or delete this group while it's in use. Remove
                  its associations from workflow steps first.
                </p>
              </div>
            </div>
          )}

          {/* Sequential approval explanation */}
          {isSequential && (
            <div className="bg-purple-950/30 border border-purple-800/30 rounded-md p-3 flex items-start gap-2">
              <ArrowDownUp className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  Sequential Approval Process
                </p>
                <p className="text-purple-200/70 text-xs mt-1">
                  Members must approve documents in the exact order shown below.
                  The next person will only receive the approval request after
                  the previous person has approved.
                </p>
              </div>
            </div>
          )}

          {/* Members list */}
          <div
            className={`border ${
              isSequential ? "border-purple-900/30" : "border-blue-900/30"
            } rounded-lg`}
          >
            <div
              className={`p-3 border-b ${
                isSequential
                  ? "border-purple-900/30 bg-purple-950/50"
                  : "border-blue-900/30 bg-blue-950/50"
              }`}
            >
              <h4 className="flex items-center gap-2 text-blue-200 font-medium">
                {isSequential ? (
                  <ListOrdered className="h-4 w-4 text-purple-400" />
                ) : (
                  <UserRound className="h-4 w-4 text-blue-400" />
                )}
                {isSequential ? "Approval Sequence" : "Group Members"} (
                {group.approvers?.length || 0})
              </h4>
            </div>
            <ScrollArea className="max-h-[300px]">
              <div className="p-4">
                {group.approvers && group.approvers.length > 0 ? (
                  <div className="space-y-2 relative">
                    {isSequential && (
                      <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-purple-700/30 z-0" />
                    )}

                    {group.approvers.map((approver, index) => (
                      <div
                        key={approver.userId}
                        className={`flex items-center p-3 rounded-md ${
                          isSequential
                            ? "bg-gradient-to-r from-purple-900/30 to-purple-900/10 border border-purple-800/30"
                            : "bg-blue-950/50"
                        } relative z-10`}
                      >
                        {isSequential && (
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-800/70 text-purple-100 text-xs mr-3">
                            {index + 1}
                          </div>
                        )}
                        <UserRound
                          className={`h-4 w-4 ${
                            isSequential ? "text-purple-400" : "text-blue-400"
                          } mr-2`}
                        />
                        <span className="text-blue-100">
                          {approver.username}
                        </span>

                        {isSequential && (
                          <Badge
                            className={`ml-auto text-xs ${
                              index === 0
                                ? "bg-purple-800/50 text-purple-100"
                                : index === group.approvers.length - 1
                                ? "bg-green-800/50 text-green-100"
                                : "bg-blue-800/50 text-blue-100"
                            }`}
                          >
                            {index === 0
                              ? "First"
                              : index === group.approvers.length - 1
                              ? "Final"
                              : `Step ${index + 1}`}
                          </Badge>
                        )}

                        {isSequential && index < group.approvers.length - 1 && (
                          <div className="absolute bottom-0 left-3 transform translate-y-1/2">
                            <ArrowDown className="h-4 w-4 text-purple-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-blue-500/60">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No members in this group</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Info box */}
          <div
            className={`${
              isSequential
                ? "bg-purple-950/30 border-purple-900/20"
                : "bg-blue-950/30 border-blue-900/20"
            } p-4 rounded-md border flex gap-3`}
          >
            <Info
              className={`h-5 w-5 ${
                isSequential ? "text-purple-400" : "text-blue-400"
              } flex-shrink-0 mt-0.5`}
            />
            <div className="text-sm text-blue-300">
              <p className="mb-1">
                This approval group defines how document approvals are
                processed.
              </p>
              {group.ruleType === "All" && (
                <p>All members must approve for the document to proceed.</p>
              )}
              {group.ruleType === "Any" && (
                <p>Any single member can approve the document to proceed.</p>
              )}
              {group.ruleType === "Sequential" && (
                <p className="text-purple-200">
                  Members must approve in the exact sequence shown above. The
                  approval request follows this order precisely.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-800 text-blue-300 hover:bg-blue-900/20"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
