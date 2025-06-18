import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface UserTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
}

export function UserTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: UserTableHeaderProps) {
  const { t } = useTranslation();

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );
  };

  const headerClass = (field: string) => `
    text-foreground font-medium cursor-pointer select-none
    hover:text-primary transition-colors duration-150
    ${sortBy === field ? "text-primary" : ""}
  `;

  return (
    <TableHeader className="bg-muted/20 backdrop-blur-sm">
      <TableRow className="border-border/30 hover:bg-transparent">
        <TableHead className="w-[48px]">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedCount > 0 && selectedCount === totalCount}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        </TableHead>
        <TableHead className="w-[48px]"></TableHead>
        <TableHead
          className={`${headerClass("firstName")} w-[200px]`}
          onClick={() => onSort("firstName")}
        >
          <div className="flex items-center">
            {t("userManagement.user")} {renderSortIcon("firstName")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("email")} w-[280px]`}
          onClick={() => onSort("email")}
        >
          <div className="flex items-center">
            {t("userManagement.email")} {renderSortIcon("email")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("role")} w-[150px]`}
          onClick={() => onSort("role")}
        >
          <div className="flex items-center">
            {t("userManagement.role")} {renderSortIcon("role")}
          </div>
        </TableHead>
        <TableHead
          className={`${headerClass("isActive")} w-[120px]`}
          onClick={() => onSort("isActive")}
        >
          <div className="flex items-center">
            {t("userManagement.status")} {renderSortIcon("isActive")}
          </div>
        </TableHead>
        <TableHead className="text-foreground font-medium w-[100px]">
          {t("userManagement.block")}
        </TableHead>
        <TableHead className="w-[80px] text-foreground font-medium text-right pr-4">
          {t("userManagement.actions")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
