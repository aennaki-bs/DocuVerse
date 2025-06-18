import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, AlertCircle, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import AddToCircuitButton from "@/components/circuits/AddToCircuitButton";

interface DocumentsHeaderProps {
  useFakeData: boolean;
  fetchDocuments: () => void;
  canManageDocuments: boolean;
  selectedDocuments: number[];
  openDeleteDialog: () => void;
  openAssignCircuitDialog: (documentId: number) => void;
}

export default function DocumentsHeader({
  useFakeData,
  fetchDocuments,
  canManageDocuments,
  selectedDocuments,
  openDeleteDialog,
  openAssignCircuitDialog,
}: DocumentsHeaderProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Documents</h1>
          <p className="text-gray-400 text-sm mt-1">
            View, create and manage your documents
          </p>
        </div>

        {useFakeData && (
          <div className="bg-amber-900/30 border border-amber-900/50 text-amber-300 px-3 py-1.5 rounded-md text-xs flex items-center">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            Using sample data
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {canManageDocuments ? (
          <>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Document
            </Button>

            {selectedDocuments.length === 1 && (
              <Button
                variant="outline"
                className="border-blue-500/50 text-blue-500 hover:bg-blue-500/20"
                onClick={() => openAssignCircuitDialog(selectedDocuments[0])}
              >
                <GitBranch className="mr-2 h-4 w-4" /> Assign to Circuit
              </Button>
            )}
          </>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                  <Plus className="mr-2 h-4 w-4" /> New Document
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                <p>Only Admin or FullUser can create documents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {canManageDocuments && selectedDocuments.length > 0 && (
          <Button variant="destructive" onClick={openDeleteDialog}>
            <Plus className="mr-2 h-4 w-4" /> Delete Selected (
            {selectedDocuments.length})
          </Button>
        )}
      </div>

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchDocuments}
      />
    </div>
  );
}
