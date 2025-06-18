import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash, GitBranch, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/models/document";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkflowDialogButton } from "@/components/document-flow/WorkflowDialogButton";

interface DocumentActionsProps {
  document: Document;
  canManageDocuments: boolean;
  onDelete: () => void;
  onDocumentFlow: () => void;
  onWorkflowUpdate?: () => void;
}

const DocumentActions = ({
  document,
  canManageDocuments,
  onDelete,
  onDocumentFlow,
  onWorkflowUpdate,
}: DocumentActionsProps) => {
  const [isAssignCircuitOpen, setIsAssignCircuitOpen] = useState(false);

  // Refresh the page after circuit assignment
  const handleCircuitAssigned = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex space-x-3">
        {document.circuitId && (
          <WorkflowDialogButton
            documentId={document.id}
            hasCircuit={!!document.circuitId}
            buttonClassName="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
            title="Document Flow"
            onWorkflowUpdate={onWorkflowUpdate}
          />
        )}

        {/* Show Assign to Circuit button when document has no circuit and user can manage documents */}
        {!document.circuitId && canManageDocuments && (
          <Button
            variant="outline"
            className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50 flex items-center gap-2"
            onClick={() => setIsAssignCircuitOpen(true)}
          >
            <GitBranch className="h-4 w-4 mr-2" /> Assign to Circuit
          </Button>
        )}

        {canManageDocuments && (
          <>
            <Button
              variant="outline"
              className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50 flex items-center gap-2"
              asChild
            >
              <Link to={`/documents/${document.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600/80 hover:bg-red-700/80 flex items-center gap-2"
              onClick={onDelete}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
          </>
        )}

        {!canManageDocuments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className="border-blue-400/30 text-blue-300 opacity-60 cursor-not-allowed flex items-center gap-2"
                    disabled
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border-blue-500/30 text-blue-300">
                <p>Only Admin or FullUser can edit documents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Assign Circuit Dialog */}
      <AssignCircuitDialog
        documentId={document.id}
                  documentKey={document.documentKey}
        documentTypeId={document.typeId}
        open={isAssignCircuitOpen}
        onOpenChange={setIsAssignCircuitOpen}
        onSuccess={handleCircuitAssigned}
      />
    </>
  );
};

export default DocumentActions;
