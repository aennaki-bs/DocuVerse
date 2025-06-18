import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Filter,
  XCircle,
  Search,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import approvalService from "@/services/approvalService";
import { PendingApproval } from "@/models/approval";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { AnimatePresence, motion } from "framer-motion";

export default function PendingApprovalsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pending approvals
  const {
    data: pendingApprovals,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pendingApprovals", user?.userId],
    queryFn: () => approvalService.getPendingApprovals(),
    enabled: !!user?.userId,
  });

  // Filter approvals based on search query
  const filteredApprovals =
    pendingApprovals?.filter(
      (approval) =>
        approval.documentTitle
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        approval.documentKey
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        approval.stepTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleSelection = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        filteredApprovals.map((approval) => approval.approvalId)
      );
    } else {
      setSelectedItems([]);
    }
  };

  const handleApproveSelected = () => {
    setIsApproveDialogOpen(true);
  };

  const handleRejectSelected = () => {
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    setIsSubmitting(true);
    try {
      // Process each selected approval
      for (const approvalId of selectedItems) {
        await approvalService.respondToApproval(approvalId, {
          isApproved: true,
          comments: comments,
        });
      }

      toast.success(
        `Successfully approved ${selectedItems.length} document(s)`
      );
      setSelectedItems([]);
      setComments("");
      setIsApproveDialogOpen(false);

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
    } catch (error) {
      console.error("Error approving documents:", error);
      toast.error("Failed to approve documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmReject = async () => {
    if (!comments.trim()) {
      toast.error("Please provide comments for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process each selected approval
      for (const approvalId of selectedItems) {
        await approvalService.respondToApproval(approvalId, {
          isApproved: false,
          comments: comments,
        });
      }

      toast.success(
        `Successfully rejected ${selectedItems.length} document(s)`
      );
      setSelectedItems([]);
      setComments("");
      setIsRejectDialogOpen(false);

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
    } catch (error) {
      console.error("Error rejecting documents:", error);
      toast.error("Failed to reject documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-blue-900/30 bg-gradient-to-r from-[#1a2c6b]/50 to-[#0a1033]/50 p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 md:mb-2 text-white flex items-center">
              <Clock className="mr-2 h-6 w-6 text-amber-500" /> Pending
              Approvals
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Documents waiting for your approval or action
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search approvals..."
                className="pl-8 bg-[#111633] border-blue-900/50 text-white w-[250px] focus:border-blue-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl text-white">
            Documents Pending Approval
          </CardTitle>
          <CardDescription>
            {filteredApprovals.length} document
            {filteredApprovals.length !== 1 ? "s" : ""} waiting for your
            response
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <h3 className="text-xl font-semibold text-white">
                Failed to load approvals
              </h3>
              <p className="text-gray-400 mt-2">
                There was an error loading your pending approvals.
              </p>
              <Button
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["pendingApprovals"],
                  })
                }
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
              <h3 className="text-xl font-semibold text-white">
                No pending approvals
              </h3>
              <p className="text-gray-400 mt-2">
                You don't have any documents waiting for your approval.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-[#151f3f]">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          filteredApprovals.length > 0 &&
                          selectedItems.length === filteredApprovals.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">Doc ID</TableHead>
                    <TableHead className="min-w-[200px]">Document</TableHead>
                    <TableHead className="min-w-[150px]">Requester</TableHead>
                    <TableHead className="min-w-[150px]">Step</TableHead>
                    <TableHead className="min-w-[180px]">Date</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.map((approval) => (
                    <TableRow
                      key={approval.approvalId}
                      className={
                        selectedItems.includes(approval.approvalId)
                          ? "bg-blue-900/20 hover:bg-blue-900/30"
                          : "hover:bg-blue-900/10"
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(approval.approvalId)}
                          onCheckedChange={() =>
                            handleSelection(approval.approvalId)
                          }
                          aria-label={`Select approval ${approval.approvalId}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">
                        {approval.documentKey}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white">
                          {approval.documentTitle}
                        </div>
                      </TableCell>
                      <TableCell>{approval.requestedBy}</TableCell>
                      <TableCell>{approval.stepTitle}</TableCell>
                      <TableCell>{formatDate(approval.requestDate)}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-500/80 hover:bg-amber-500">
                          Pending
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Documents</DialogTitle>
            <DialogDescription>
              You are about to approve {selectedItems.length} document
              {selectedItems.length !== 1 ? "s" : ""}. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-900/20 p-3 border border-blue-800/50">
              <p className="text-sm text-blue-300">
                <FileText className="inline mr-2 h-4 w-4" />
                Selected documents: {selectedItems.length}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="comments"
                className="text-sm font-medium text-gray-200"
              >
                Comments (optional)
              </label>
              <Textarea
                id="comments"
                placeholder="Add any comments about your approval decision..."
                className="bg-[#111633] border-blue-900/50 text-white resize-none focus:border-blue-500/50"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
              className="border-blue-800 text-gray-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Documents</DialogTitle>
            <DialogDescription>
              You are about to reject {selectedItems.length} document
              {selectedItems.length !== 1 ? "s" : ""}. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-red-900/20 p-3 border border-red-800/50">
              <p className="text-sm text-red-300">
                <AlertCircle className="inline mr-2 h-4 w-4" />
                Selected documents: {selectedItems.length}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reject-comments"
                className="text-sm font-medium text-gray-200"
              >
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <Textarea
                id="reject-comments"
                placeholder="Please provide a reason for rejection..."
                className="bg-[#111633] border-blue-900/50 text-white resize-none focus:border-blue-500/50"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
              {!comments.trim() && (
                <p className="text-xs text-red-400">
                  Comments are required for rejection
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
              className="border-blue-800 text-gray-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              disabled={isSubmitting || !comments.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom action bar for bulk actions */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedItems.length}
            entityName="document"
            icon={<FileText className="w-5 h-5 text-blue-400" />}
            actions={[
              {
                id: "approve",
                label: "Approve Selected",
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: handleApproveSelected,
                variant: "default",
                className:
                  "bg-green-900/30 border-green-500/30 text-green-400 hover:bg-green-900/50",
              },
              {
                id: "reject",
                label: "Reject Selected",
                icon: <XCircle className="h-4 w-4" />,
                onClick: handleRejectSelected,
                variant: "destructive",
                className:
                  "bg-red-900/30 border-red-500/30 text-red-400 hover:bg-red-900/50",
              },
            ]}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
