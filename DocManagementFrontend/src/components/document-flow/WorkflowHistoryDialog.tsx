import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import { WorkflowHistorySection } from "./WorkflowHistorySection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WorkflowHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  documentTitle?: string;
}

export function WorkflowHistoryDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
}: WorkflowHistoryDialogProps) {
  // Fetch document circuit history
  const {
    data: circuitHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document-circuit-history", documentId],
    queryFn: () => circuitService.getDocumentCircuitHistory(documentId),
    enabled: open && !!documentId, // Only fetch when dialog is open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[90vh] overflow-hidden flex flex-col bg-[#0a1033]">
        <DialogHeader className="px-4 py-2 border-b border-blue-900/30">
          <div className="flex items-center">
            <div>
              <DialogTitle className="text-lg font-medium text-white flex items-center">
                <History className="h-5 w-5 mr-2 text-blue-400" />
                Document Workflow History
              </DialogTitle>
              <DialogDescription className="text-blue-300/70">
                {documentTitle ? `${documentTitle} - ` : ""}
                Timeline of status changes and actions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-4">
          <WorkflowHistorySection
            history={circuitHistory || []}
            isLoading={isLoading}
            isEmbedded={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
