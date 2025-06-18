import { FilterOption } from '../TableAdvancedFilters';

export const DEFAULT_STATUS_FILTERS: FilterOption[] = [
  { id: 0, label: "Any Status", value: "any" },
  { id: 1, label: "Draft", value: "0" },
  { id: 2, label: "In Progress", value: "1" },
  { id: 3, label: "Completed", value: "2" },
  { id: 4, label: "Rejected", value: "3" },
];

export const DEFAULT_TYPE_FILTERS: FilterOption[] = [
  { id: 0, label: "Any Type", value: "any" }
  // Document types will be fetched from API
];

export const DEFAULT_DOCUMENT_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'documentKey', label: 'Document Code' },
  { id: 'title', label: 'Title' },
  { id: 'documentType.typeName', label: 'Type' },
  { id: 'docDate', label: 'Document Date' },
  { id: 'createdBy.username', label: 'Created By' }
];

export const DEFAULT_USER_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'username', label: 'Username' },
  { id: 'email', label: 'Email' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'role.roleName', label: 'Role' }
];

export const DEFAULT_STEP_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'title', label: 'Title' },
  { id: 'stepKey', label: 'Step Code' },
  { id: 'descriptif', label: 'Description' },
  { id: 'circuit.title', label: 'Circuit' },
  { id: 'orderIndex', label: 'Order Index' }
];

export const DEFAULT_CIRCUIT_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'title', label: 'Title' },
  { id: 'circuitKey', label: 'Circuit Key' },
  { id: 'descriptif', label: 'Description' }
];
