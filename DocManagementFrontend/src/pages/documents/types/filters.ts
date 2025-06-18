import { DateRange } from "react-day-picker";

export interface FilterOptions {
  searchField?: string;
  statusFilter?: string;
  typeFilter?: string;
  dateRange?: DateRange | undefined;
}

export interface DocumentStatusFilter {
  id: number;
  label: string;
  value: string;
}

export interface DocumentTypeFilter {
  id: number;
  label: string;
  value: string;
}

export const STATUS_FILTERS: DocumentStatusFilter[] = [
  { id: 0, label: "Any Status", value: "any" },
  { id: 1, label: "Draft", value: "0" },
  { id: 2, label: "In Progress", value: "1" },
  { id: 3, label: "Completed", value: "2" },
  { id: 4, label: "Rejected", value: "3" },
];

export const TYPE_FILTERS: DocumentTypeFilter[] = [
  { id: 0, label: "Any Type", value: "any" },
  { id: 1, label: "Proposal", value: "1" },
  { id: 2, label: "Report", value: "2" },
  { id: 3, label: "Minutes", value: "3" },
  { id: 4, label: "Specifications", value: "4" },
];
