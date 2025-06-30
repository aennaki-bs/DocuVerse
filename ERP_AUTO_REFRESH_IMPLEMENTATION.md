# ERP Auto-Refresh Implementation

## Overview
This implementation adds automatic page refresh functionality when documents are archived to ERP, ensuring that ERP data (like ERP Document Code) appears immediately without requiring manual refresh.

## Problem Solved
Previously, when a document was archived to ERP through workflow actions, the archival happened asynchronously in the background. Users would see the workflow complete but wouldn't see the "Archived to ERP" status and ERP Document Code until they manually refreshed the page.

## Solution Architecture

### 1. ERP Archival Detection Hook (`useErpArchivalDetection.ts`)
A reusable custom hook that provides ERP archival monitoring functionality:

- **Function**: `startErpArchivalMonitoring(documentId, initialDocument, onArchivalComplete)`
- **Polling**: Checks every 5 seconds for up to 1 minute (12 attempts)
- **Smart Detection**: Only starts monitoring if document wasn't already archived
- **Success Handling**: Shows success toast and triggers callback when archival completes
- **Cleanup**: Automatically stops polling after max attempts or on error

### 2. Workflow Actions Integration (`useWorkflowActions.ts`)
Enhanced the workflow actions hook to detect potential ERP archival triggers:

- **Pre-Action Check**: Captures document state before workflow action
- **Conditional Monitoring**: Only monitors for ERP archival if document wasn't already archived
- **Delayed Start**: Waits 2 seconds before starting to poll (allows backend processing time)
- **Automatic Refresh**: Triggers `onActionSuccess()` callback to refresh all queries

### 3. Workflow Dialog Enhancement (`WorkflowDialog.tsx`)
Added ERP archival detection to status transitions:

- **Status Move Detection**: Monitors for ERP archival when moving to final statuses
- **Comprehensive Refresh**: Refreshes both internal data and parent component
- **User Feedback**: Shows success toast with ERP Document Code when archival completes

## How It Works

### Workflow Sequence
1. User performs workflow action (approve/move to final status)
2. Frontend captures document state before action
3. Workflow action completes successfully
4. If document wasn't already archived, start ERP archival monitoring
5. Poll document API every 5 seconds to check for `erpDocumentCode`
6. When ERP archival completes:
   - Stop polling
   - Show success toast with ERP Document Code
   - Refresh all document-related queries
   - Update UI automatically

### Integration Points
- **ViewDocument Page**: Uses `handleWorkflowUpdate()` for comprehensive refresh
- **Document Flow Pages**: Integrated through workflow hooks
- **All Workflow Components**: Automatically benefit from the hook-based implementation

## Technical Details

### Polling Strategy
```typescript
const pollInterval = setInterval(async () => {
  const updatedDocument = await documentService.getDocumentById(documentId);
  if (updatedDocument.erpDocumentCode) {
    // Archival complete - refresh and notify
    clearInterval(pollInterval);
    toast.success(`Document archived to ERP with code: ${updatedDocument.erpDocumentCode}`);
    onArchivalComplete();
  }
}, 5000); // Poll every 5 seconds
```

### Error Handling
- Graceful failure: Stops polling on API errors without showing error to user
- Timeout handling: Stops after maximum attempts to prevent infinite polling
- Memory management: Proper cleanup of intervals

### Performance Considerations
- **Conditional Activation**: Only runs when needed (document not already archived)
- **Limited Duration**: Maximum 1-minute polling window
- **Efficient Queries**: Uses existing document service endpoints
- **Smart Cleanup**: Automatic interval cleanup prevents memory leaks

## User Experience Improvements

### Before Implementation
1. User completes workflow action
2. Document status updates in UI
3. User must manually refresh page to see ERP archival status
4. ERP Document Code not visible until refresh

### After Implementation
1. User completes workflow action
2. Document status updates in UI immediately
3. System automatically detects ERP archival completion
4. Success toast shows: "Document archived to ERP with code: 1005"
5. All document data refreshes automatically
6. ERP status and code visible immediately

## Files Modified

### New Files
- `DocManagementFrontend/src/hooks/useErpArchivalDetection.ts` - Reusable ERP archival detection hook

### Modified Files
- `DocManagementFrontend/src/hooks/document-workflow/useWorkflowActions.ts` - Added ERP archival monitoring
- `DocManagementFrontend/src/components/document-flow/WorkflowDialog.tsx` - Enhanced status transitions with ERP detection

### Existing Infrastructure Used
- `DocManagementFrontend/src/pages/ViewDocument.tsx` - `handleWorkflowUpdate()` function
- Document service APIs for polling
- React Query for cache invalidation
- Toast notifications for user feedback

## Configuration Options

The `useErpArchivalDetection` hook supports customization:

```typescript
startErpArchivalMonitoringCustom(documentId, initialDocument, onComplete, {
  maxAttempts: 12,        // Number of polling attempts (default: 12)
  pollIntervalMs: 5000,   // Polling interval in ms (default: 5000)
  showSuccessToast: true  // Show success toast (default: true)
});
```

## Future Enhancements

### Potential Improvements
1. **WebSocket Integration**: Real-time notifications instead of polling
2. **Background Sync Indicator**: Visual indicator showing archival in progress
3. **Retry Mechanism**: Automatic retry if initial archival fails
4. **Batch Archival Support**: Handle multiple documents being archived simultaneously

### Server-Side Considerations
The implementation works with the existing backend architecture where:
- ERP archival happens asynchronously in `DocumentWorkflowService.cs`
- Document updates are persisted to database when archival completes
- Frontend polls the standard document API to detect changes

## Testing

### Test Scenarios
1. **Normal Workflow**: Document workflow completion triggers ERP archival
2. **Already Archived**: Documents already archived don't trigger unnecessary polling
3. **Network Errors**: Graceful handling of API failures during polling
4. **Timeout Handling**: Polling stops after maximum attempts
5. **Multiple Documents**: System handles multiple documents being processed

### Browser Testing
- Tested build compilation (✅ successful)
- No TypeScript errors
- Proper dependency management
- Clean component lifecycle

## Conclusion

This implementation provides a seamless user experience for ERP archival by automatically detecting when archival completes and refreshing the UI accordingly. The modular design using custom hooks makes it reusable across different components while maintaining good performance and error handling characteristics. 