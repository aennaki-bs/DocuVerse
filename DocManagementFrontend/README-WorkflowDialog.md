# Document Workflow Dialog

This component provides a modal dialog that shows the document workflow status, history, and actions when triggered from a document detail page.

## Features

- Shows a comprehensive view of the document's workflow status
- Displays the document's circuit information
- Provides a visual mind map of the workflow steps
- Shows workflow history with timeline
- Allows users to mark steps as complete/incomplete
- Supports moving documents between statuses
- Fully responsive design with modern UI

## Usage

### Basic Usage with WorkflowDialogButton

The simplest way to integrate the workflow dialog is to use the `WorkflowDialogButton` component:

```tsx
import { WorkflowDialogButton } from "@/components/document-flow/WorkflowDialogButton";

function DocumentDetailPage() {
  // Assume document is loaded from an API
  const document = {
    id: 123,
    title: "Sample Document",
    circuitId: 456, // null if no circuit assigned
  };

  return (
    <div>
      <h1>{document.title}</h1>

      {/* Other document details */}

      <div className="flex gap-2 mt-4">
        <WorkflowDialogButton
          documentId={document.id}
          hasCircuit={!!document.circuitId}
        />

        {/* Other action buttons */}
      </div>
    </div>
  );
}
```

### Using the Button with Different Styles

The button component supports various display options:

```tsx
// Regular button with label
<WorkflowDialogButton documentId={123} />

// Icon-only button (good for toolbars)
<WorkflowDialogButton
  documentId={123}
  iconOnly
/>

// Custom styling
<WorkflowDialogButton
  documentId={123}
  buttonClassName="my-custom-class"
  title="Process Workflow"
/>

// Without label
<WorkflowDialogButton
  documentId={123}
  showLabel={false}
/>
```

### Using the Dialog Directly

For more control, you can use the `WorkflowDialog` component directly:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkflowDialog } from "@/components/document-flow/WorkflowDialog";

function DocumentActions({ documentId }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        Custom Workflow Button
      </Button>

      <WorkflowDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        documentId={documentId}
      />
    </>
  );
}
```

## Integration with Document Detail Page

Here's an example of how to integrate the workflow button into a document detail page toolbar:

```tsx
import { Button } from "@/components/ui/button";
import { WorkflowDialogButton } from "@/components/document-flow/WorkflowDialogButton";
import { Edit, Download, Share, Trash } from "lucide-react";

function DocumentDetailToolbar({ document }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <WorkflowDialogButton
        documentId={document.id}
        hasCircuit={!!document.circuitId}
      />

      <Button variant="outline" className="gap-1">
        <Edit className="h-4 w-4" />
        Edit
      </Button>

      <Button variant="outline" className="gap-1">
        <Download className="h-4 w-4" />
        Download
      </Button>

      <Button variant="outline" className="gap-1">
        <Share className="h-4 w-4" />
        Share
      </Button>

      <Button variant="destructive" className="gap-1 ml-auto">
        <Trash className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
```

## Workflow Dialog Behavior

The workflow dialog provides different views based on the document's state:

1. If the document has no circuit assigned, it shows a "No Circuit Assigned" card with options to edit the document
2. While loading, it shows a loading skeleton
3. If there's an error, it displays the error message with a reload option
4. For documents with circuits, it shows:
   - Circuit status summary (name, progress)
   - Document flow mind map visualization
   - Workflow history timeline

Users can:

- Mark the current status as complete/incomplete
- Move to the next status (if the current one is complete)
- View the complete workflow history
- Close the dialog to return to the document

## Technical Notes

- The dialog uses React Query for data fetching
- The workflow visualization is responsive and works on all screen sizes
- The dialog maintains its own state and refreshes automatically after actions
- User permissions are respected (e.g., simple users cannot move documents)
