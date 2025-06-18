# Unified UI System Documentation

## Overview

The DocuVerse frontend now implements a completely unified UI system that standardizes:

1. **Headers** - Glass morphism style with consistent layout
2. **Search & Filter** - Uniform search bars and filter components
3. **Table UI** - Consistent table design and scrolling behavior
4. **Bulk Actions** - Standardized bulk action UI with selection
5. **3-dots Menu** - Uniform action menus for row-level operations

## Core Components

### 1. PageLayout Component

**Location**: `src/components/layout/PageLayout.tsx`

The foundational component that provides consistent page structure with glass morphism headers.

```tsx
import { PageLayout } from "@/components/layout/PageLayout";

<PageLayout
  title="Circuit Management"
  subtitle="Create and manage document workflow circuits"
  icon={GitBranch}
  actions={actions}
>
  {/* Page content */}
</PageLayout>;
```

### 2. UnifiedTable Component

**Location**: `src/components/ui/UnifiedTable.tsx`

The comprehensive table component that handles all table functionality across the application.

```tsx
import {
  UnifiedTable,
  UnifiedColumn,
  FilterOption,
  FilterBadge,
  BulkAction,
  RowAction,
} from "@/components/ui/UnifiedTable";

<UnifiedTable
  data={filteredData}
  columns={columns}
  keyField="id"
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  // ... other props
/>;
```

## Implementation Guide

### Step 1: Define Table Columns

```tsx
const columns: UnifiedColumn<YourDataType>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    width: "200px",
    render: (item) => (
      <Link
        to={`/items/${item.id}`}
        className="text-blue-400 hover:text-blue-300"
      >
        {item.name}
      </Link>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    width: "130px",
    render: (item) => (
      <Badge variant={item.isActive ? "default" : "secondary"}>
        {item.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  // ... more columns
];
```

### Step 2: Define Search Fields

```tsx
const searchFields = [
  { id: "all", label: "All fields" },
  { id: "name", label: "Name" },
  { id: "description", label: "Description" },
];
```

### Step 3: Define Filter Options

```tsx
const filterOptions: FilterOption[] = [
  {
    id: "status",
    label: "Status",
    value: statusFilter,
    options: [
      { value: "any", label: "Any Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    onChange: setStatusFilter,
  },
];
```

### Step 4: Define Filter Badges

```tsx
const filterBadges: FilterBadge[] = [];
if (statusFilter !== "any") {
  filterBadges.push({
    id: "status",
    label: "Status",
    value: statusFilter === "active" ? "Active" : "Inactive",
    onRemove: () => setStatusFilter("any"),
  });
}
```

### Step 5: Define Bulk Actions

```tsx
const bulkActions: BulkAction[] = !isReadOnly
  ? [
      {
        id: "delete",
        label: "Delete Selected",
        icon: <Trash className="h-4 w-4" />,
        onClick: (selectedItems) => setBulkDeleteOpen(true),
        variant: "destructive",
        className:
          "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50",
      },
    ]
  : [];
```

### Step 6: Define Row Actions (3-dots menu)

```tsx
const rowActions: RowAction<YourDataType>[] = [
  {
    id: "view",
    label: "View Details",
    icon: <Eye className="h-4 w-4" />,
    onClick: (item) => navigate(`/items/${item.id}`),
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Edit className="h-4 w-4" />,
    onClick: (item) => handleEdit(item),
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash className="h-4 w-4" />,
    onClick: (item) => handleDelete(item),
    variant: "destructive",
    separator: true,
  },
];
```

### Step 7: Implement Data Filtering

```tsx
const filteredData = data.filter((item) => {
  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (searchField === "all" &&
        (item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query))) ||
      (searchField === "name" && item.name?.toLowerCase().includes(query)) ||
      (searchField === "description" &&
        item.description?.toLowerCase().includes(query));

    if (!matchesSearch) return false;
  }

  // Status filter
  if (statusFilter === "active" && !item.isActive) return false;
  if (statusFilter === "inactive" && item.isActive) return false;

  return true;
});
```

## Complete Example: Circuit Management

Here's the complete implementation for the Circuit Management page:

```tsx
export default function CircuitsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [searchField, setSearchField] = useState("all");
  const [selectedCircuits, setSelectedCircuits] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define all configurations (columns, searchFields, filterOptions, etc.)

  return (
    <PageLayout
      title="Circuit Management"
      subtitle="Create and manage document workflow circuits"
      icon={GitBranch}
      actions={actions}
    >
      <UnifiedTable
        data={filteredCircuits}
        columns={columns}
        keyField="id"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchFields={searchFields}
        selectedSearchField={searchField}
        onSearchFieldChange={setSearchField}
        searchPlaceholder="Search circuits..."
        filterOptions={filterOptions}
        filterBadges={filterBadges}
        selectedItems={selectedCircuits}
        onSelectItems={setSelectedCircuits}
        bulkActions={bulkActions}
        rowActions={rowActions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load circuits. Please try again."
        emptyMessage="No circuits found."
        initialPageSize={15}
      />
    </PageLayout>
  );
}
```

## Design System Guidelines

### Colors & Styling

- **Primary Colors**: Use `hsl(var(--primary))` and related CSS variables
- **Glass Morphism**: `bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl`
- **Borders**: `border-primary/10` for subtle borders
- **Text Colors**: `text-foreground`, `text-muted-foreground`

### Spacing & Layout

- **Consistent Gap**: Use `gap-6` for major sections, `gap-3` for smaller elements
- **Padding**: `p-6` for main containers, `p-3` for nested elements
- **Rounded Corners**: `rounded-xl` for main containers, `rounded-lg` for smaller elements

### Interactive Elements

- **Hover States**: All interactive elements should have hover states
- **Loading States**: Use `<Loader2 className="h-4 w-4 animate-spin" />` for loading indicators
- **Transitions**: `transition-all duration-200` for smooth interactions

## TypeScript Interfaces

### Core Interfaces

```tsx
interface UnifiedColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedItems: any[]) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

interface RowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}
```

## Migration Guide

### Before (Old Pattern)

```tsx
// Multiple separate components
<PageHeader title="..." />
<SearchAndFilterBar />
<FilterBadges />
<CustomTable />
<BulkActionsBar />
```

### After (Unified Pattern)

```tsx
// Single unified component
<PageLayout title="..." actions={actions}>
  <UnifiedTable
    data={data}
    columns={columns}
    // All functionality in one component
  />
</PageLayout>
```

## Benefits

1. **Consistency**: All pages look and behave identically
2. **Maintainability**: Single source of truth for table functionality
3. **Performance**: Optimized scrolling and pagination
4. **Accessibility**: Built-in ARIA labels and keyboard navigation
5. **Developer Experience**: Simple, declarative API
6. **Flexibility**: Highly configurable while maintaining consistency

## Pages Using Unified System

- ✅ **User Management** - Complete implementation
- ✅ **Circuit Management** - Complete implementation
- 🔄 **Document Types** - Needs migration
- 🔄 **Documents** - Needs migration
- 🔄 **Settings** - Already uses PageLayout
- 🔄 **Line Elements** - Needs migration

## Future Enhancements

- **Export functionality** - Add standardized export options
- **Advanced filtering** - Date ranges, multi-select filters
- **Column customization** - User-configurable column visibility
- **Saved views** - Save and restore filter/sort combinations
- **Real-time updates** - WebSocket integration for live data
