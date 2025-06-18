import {
  ArrowUpDown,
  Tag,
  FileText,
  Filter,
  CalendarDays,
  User,
  AlertCircle,
} from "lucide-react";
import { Document } from "@/models/document";
import DocumentsTableRow from "./DocumentsTableRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface DocumentsTableProps {
  documents: Document[];
  selectedDocuments: number[];
  canManageDocuments: boolean;
  handleSelectDocument: (id: number) => void;
  handleSelectAll: () => void;
  openDeleteDialog: (id: number) => void;
  openAssignCircuitDialog: (document: Document) => void;
  page: number;
  pageSize: number;
  sortConfig: { key: string; direction: "ascending" | "descending" } | null;
  requestSort: (key: string) => void;
}

export default function DocumentsTable({
  documents,
  selectedDocuments,
  canManageDocuments,
  handleSelectDocument,
  handleSelectAll,
  openDeleteDialog,
  openAssignCircuitDialog,
  page,
  pageSize,
  sortConfig,
  requestSort,
}: DocumentsTableProps) {
  const { t } = useTranslation();
  const getSortIndicator = (columnKey: string) => {
    if (sortConfig && sortConfig.key === columnKey) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return null;
  };

  const renderSortableHeader = (
    label: string,
    key: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none group"
      onClick={() => requestSort(key)}
    >
      <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
        {icon}
      </span>
      <span className="group-hover:text-blue-200 transition-colors">
        {label}
      </span>
      <div className="ml-1 w-4 text-center">
        {getSortIndicator(key) ? (
          <span className="text-blue-300">{getSortIndicator(key)}</span>
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      {/* Fixed Header - Never Scrolls */}
      <div className="min-w-[1200px] border-b border-blue-900/30">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
            <TableRow className="border-blue-900/50 hover:bg-transparent">
              <TableHead className="w-[50px] text-blue-300 font-medium">
                {canManageDocuments ? (
                  <Checkbox
                    checked={
                      selectedDocuments.length === documents.length &&
                      documents.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                  />
                ) : (
                  <span>#</span>
                )}
              </TableHead>
              <TableHead className="w-[160px] text-blue-300 font-medium">
                {renderSortableHeader(
                  t("documents.documentCode"),
                  "documentKey",
                  <Tag className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[250px] text-blue-300 font-medium">
                {renderSortableHeader(
                  t("common.title"),
                  "title",
                  <FileText className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[120px] text-blue-300 font-medium">
                {renderSortableHeader(
                  t("common.status"),
                  "status",
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[150px] text-blue-300 font-medium">
                {renderSortableHeader(
                  t("common.type"),
                  "documentType",
                  <Filter className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[140px] text-blue-300 font-medium">
                {renderSortableHeader(
                  t("documents.documentDate"),
                  "docDate",
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[150px] text-blue-300 font-medium">
                {renderSortableHeader(
                  t("documents.createdBy"),
                  "createdBy",
                  <User className="h-4 w-4 text-blue-400" />
                )}
              </TableHead>
              <TableHead className="w-[100px] text-right text-blue-300 font-medium">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body - Only Content Scrolls */}
      <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
        <div className="min-w-[1200px]">
          <Table className="table-fixed w-full">
            <TableBody>
              {documents.map((document, index) => (
                <DocumentsTableRow
                  key={document.id}
                  document={document}
                  index={index + (page - 1) * pageSize}
                  isSelected={selectedDocuments.includes(document.id)}
                  canManageDocuments={canManageDocuments}
                  onSelect={() => handleSelectDocument(document.id)}
                  onDelete={() => openDeleteDialog(document.id)}
                  onAssignCircuit={() => openAssignCircuitDialog(document)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
