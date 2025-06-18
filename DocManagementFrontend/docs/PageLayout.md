# PageLayout Component

A reusable layout component that provides a consistent UI pattern across all pages in the DocuVerse application.

## Features

- **Consistent Header Design**: Beautiful glass morphism header with gradient backgrounds
- **Flexible Actions**: Support for multiple action buttons with different variants
- **Icon Integration**: Built-in icon support for page identification
- **Responsive Design**: Works seamlessly across different screen sizes
- **Type Safety**: Full TypeScript support with proper interfaces

## Usage

### Basic Usage

```tsx
import { PageLayout } from "@/components/layout/PageLayout";
import { Users } from "lucide-react";

function MyPage() {
  return (
    <PageLayout
      title="Page Title"
      subtitle="Page description or subtitle"
      icon={Users}
    >
      {/* Your page content goes here */}
      <div>Main content area</div>
    </PageLayout>
  );
}
```

### With Actions

```tsx
import { PageLayout } from "@/components/layout/PageLayout";
import { Users, UserPlus, Download } from "lucide-react";

function MyPage() {
  const pageActions = [
    {
      label: "Export Data",
      variant: "outline" as const,
      icon: Download,
      onClick: () => {
        // Export functionality
      },
    },
    {
      label: "Create New",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => {
        // Create functionality
      },
    },
  ];

  return (
    <PageLayout
      title="My Page"
      subtitle="Manage your data"
      icon={Users}
      actions={pageActions}
    >
      <div>Main content area</div>
    </PageLayout>
  );
}
```

## Props

### PageLayoutProps

| Prop       | Type           | Required | Description                       |
| ---------- | -------------- | -------- | --------------------------------- |
| `title`    | `string`       | Yes      | The main page title               |
| `subtitle` | `string`       | Yes      | The page subtitle/description     |
| `icon`     | `LucideIcon`   | Yes      | The icon to display in the header |
| `actions`  | `PageAction[]` | No       | Array of action buttons           |
| `children` | `ReactNode`    | Yes      | The main content of the page      |

### PageAction

| Prop      | Type            | Required | Description                               |
| --------- | --------------- | -------- | ----------------------------------------- |
| `label`   | `string`        | Yes      | The button text                           |
| `onClick` | `() => void`    | Yes      | Click handler function                    |
| `variant` | `ButtonVariant` | No       | Button style variant (default: "default") |
| `icon`    | `LucideIcon`    | No       | Optional icon for the button              |

## Button Variants

- `"default"` - Primary button with gradient background
- `"outline"` - Outlined button with transparent background
- `"secondary"` - Secondary styling
- `"destructive"` - For delete/danger actions
- `"ghost"` - Minimal styling
- `"link"` - Link-style button

## Design System

The PageLayout follows the established design system:

- **Glass Morphism**: Header uses backdrop blur and gradient backgrounds
- **Primary Colors**: Consistent use of primary color scheme
- **Typography**: Large title (text-3xl) with gradient text effect
- **Spacing**: Standard gap-6 between header and content
- **Shadows**: Professional shadow effects for depth

## Examples

### User Management Page

```tsx
const pageActions = [
  {
    label: "Export Users",
    variant: "outline" as const,
    icon: Users,
    onClick: exportUsers,
  },
  {
    label: "Create User",
    variant: "default" as const,
    icon: UserPlus,
    onClick: () => setCreateUserOpen(true),
  },
];

<PageLayout
  title="User Management"
  subtitle="Manage users and their permissions"
  icon={Users}
  actions={pageActions}
>
  <UserTable />
</PageLayout>;
```

### Document Management Page

```tsx
const pageActions = [
  {
    label: "Upload Document",
    variant: "default" as const,
    icon: Upload,
    onClick: uploadDocument,
  },
];

<PageLayout
  title="Documents"
  subtitle="Manage your documents"
  icon={FileText}
  actions={pageActions}
>
  <DocumentList />
</PageLayout>;
```

### Settings Page

```tsx
// Settings page without actions
<PageLayout
  title="Settings"
  subtitle="Customize your application"
  icon={Settings}
>
  <SettingsForm />
</PageLayout>
```

## Migration Guide

To migrate existing pages to use PageLayout:

1. Import the PageLayout component
2. Wrap your content with PageLayout
3. Move header elements (title, subtitle, icon) to PageLayout props
4. Convert action buttons to the actions array format
5. Remove custom header styling

### Before

```tsx
function MyPage() {
  return (
    <div className="...">
      <div className="header-styles...">
        <h1>Page Title</h1>
        <Button onClick={action}>Action</Button>
      </div>
      <div className="content...">Content</div>
    </div>
  );
}
```

### After

```tsx
function MyPage() {
  const actions = [
    { label: "Action", onClick: action, variant: "default" as const },
  ];

  return (
    <PageLayout
      title="Page Title"
      subtitle="Description"
      icon={Icon}
      actions={actions}
    >
      Content
    </PageLayout>
  );
}
```
