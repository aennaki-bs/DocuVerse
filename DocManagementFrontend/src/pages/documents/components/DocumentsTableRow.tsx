import { Link, useNavigate } from "react-router-dom";
import { Document } from "@/models/document";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit,
  Trash,
  GitBranch,
  CheckCircle,
  MoreVertical,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface DocumentsTableRowProps {
  document: Document;
  index: number;
  isSelected: boolean;
  canManageDocuments: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAssignCircuit: () => void;
}

// Document Actions Dropdown component
const DocumentActionsDropdown = ({
  document,
  canManageDocuments,
  onDelete,
  onAssignCircuit,
}: {
  document: Document;
  canManageDocuments: boolean;
  onDelete: () => void;
  onAssignCircuit: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAssignedToCircuit = !!document.circuitId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-800/30 transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-blue-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#1a2c6b] border-blue-900/60 text-blue-100 rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
      >
        <DropdownMenuLabel className="text-blue-300">{t("common.actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-blue-900/60" />

        <DropdownMenuItem
          className="hover:bg-blue-900/40 focus:bg-blue-900/40 cursor-pointer"
          onClick={() => navigate(`/documents/${document.id}`)}
        >
          <ExternalLink className="mr-2 h-4 w-4 text-blue-400" />
          {t("documents.viewDocument")}
        </DropdownMenuItem>

        {canManageDocuments && (
          <>
            {/* Show Document Flow if assigned to circuit */}
            {isAssignedToCircuit && (
              <DropdownMenuItem
                className="hover:bg-blue-900/40 focus:bg-blue-900/40 cursor-pointer"
                onClick={() => navigate(`/documents/${document.id}/flow`)}
              >
                <GitBranch className="mr-2 h-4 w-4 text-blue-400" />
                {t("documents.documentFlow")}
              </DropdownMenuItem>
            )}

            {/* Show Assign to Circuit if not assigned */}
            {!isAssignedToCircuit && (
              <DropdownMenuItem
                className="hover:bg-blue-900/40 focus:bg-blue-900/40 cursor-pointer"
                onClick={onAssignCircuit}
              >
                <GitBranch className="mr-2 h-4 w-4 text-blue-400" />
                {t("documents.assignToCircuit")}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="hover:bg-blue-900/40 focus:bg-blue-900/40 cursor-pointer"
              asChild
            >
              <Link to={`/documents/${document.id}/edit`}>
                <Edit className="mr-2 h-4 w-4 text-blue-400" />
                {t("common.edit")}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-blue-900/60" />

            <DropdownMenuItem
              className="text-red-400 hover:bg-red-900/30 hover:text-red-300 focus:bg-red-900/30 focus:text-red-300 cursor-pointer"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </>
        )}

        {!canManageDocuments && (
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
            <Edit className="mr-2 h-4 w-4" />
            {t("documents.requiresPermissions")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DocumentsTableRow({
  document,
  index,
  isSelected,
  canManageDocuments,
  onSelect,
  onDelete,
  onAssignCircuit,
}: DocumentsTableRowProps) {
  // Check if document is already assigned to a circuit
  const isAssignedToCircuit = !!document.circuitId;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={`border-blue-900/30 hover:bg-blue-900/20 transition-all duration-200 ${
        isSelected ? "bg-blue-900/30 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <TableCell className="w-[50px] py-3">
        {canManageDocuments ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        ) : (
          <span className="text-sm text-gray-500">{index + 1}</span>
        )}
      </TableCell>
      <TableCell className="w-[160px] font-mono text-sm py-3">
        <Link
          to={`/documents/${document.id}`}
          className="text-blue-300 hover:text-blue-200 hover:underline transition-colors flex items-center gap-1"
        >
          <FileText className="h-3.5 w-3.5 opacity-70" />
          {document.documentKey}
        </Link>
      </TableCell>
      <TableCell className="w-[250px] py-3">
        <Link
          to={`/documents/${document.id}`}
          className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
        >
          {document.title}
        </Link>
      </TableCell>
      <TableCell className="w-[120px] py-3">
        {getStatusBadge(document.status)}
      </TableCell>
      <TableCell className="w-[150px] text-blue-100 py-3">
        {document.documentType.typeName}
      </TableCell>
      <TableCell className="w-[140px] text-blue-100/70 text-sm py-3">
        {new Date(document.docDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="w-[150px] py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border border-blue-700/50">
            <AvatarFallback className="bg-gradient-to-br from-blue-800 to-blue-900 text-xs text-blue-100">
              {document.createdBy.firstName[0]}
              {document.createdBy.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-blue-100/80">
            {document.createdBy.username}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-[100px] text-right py-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DocumentActionsDropdown
                  document={document}
                  canManageDocuments={canManageDocuments}
                  onDelete={onDelete}
                  onAssignCircuit={onAssignCircuit}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a2c6b] border-blue-900/60 text-blue-100">
              Document Actions
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </motion.tr>
  );
}

function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return (
        <Badge className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border-amber-500/30 px-3 py-1 text-xs font-medium">
          Draft
        </Badge>
      );
    case 1:
      return (
        <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30 px-3 py-1 text-xs font-medium">
          In progress
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 border-blue-500/30 px-3 py-1 text-xs font-medium">
          Completed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
          Unknown
        </Badge>
      );
  }
}
