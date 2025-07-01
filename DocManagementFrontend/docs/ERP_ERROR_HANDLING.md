# Enhanced ERP Error Handling

This document describes the comprehensive error handling system implemented for ERP operations in DocuVerse, specifically for Business Central API integration.

## Overview

The enhanced error handling system provides:
- **Detailed Error Messages**: User-friendly error descriptions with context
- **Error Classification**: Categorized error types for appropriate responses
- **Actionable Guidance**: Specific suggestions for resolving issues
- **Consistent UI/UX**: Standardized error presentation across the application
- **Developer-Friendly**: Structured error information for debugging

## Backend Implementation

### Error Response Models

```csharp
public class ErpOperationResult
{
    public bool IsSuccess { get; set; }
    public string? Value { get; set; }  // ERP code on success
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }  // Technical details
    public int? StatusCode { get; set; }
    public string? ErrorType { get; set; }  // Error category
}
```

### Enhanced API Methods

The following backend services have been updated:

1. **DocumentErpArchivalService**
   - `CallBusinessCenterApi()` - Returns detailed error information
   - `CallBusinessCenterLineApi()` - Enhanced line creation error handling
   - Error extraction from Business Central OData responses

2. **LigneController**
   - Enhanced ERP line creation with detailed error reporting
   - Structured error responses for frontend consumption

3. **DocumentsController**
   - Improved error responses for document archival operations
   - Consistent error format across endpoints

### Error Types Handled

- **NetworkError**: Connection issues to Business Central
- **TimeoutError**: Request timeouts due to system load
- **ValidationError**: Data validation failures
- **AuthenticationError**: API credential issues
- **AuthorizationError**: Permission problems
- **NotFoundError**: Missing resources in Business Central
- **ServerError**: Business Central internal errors
- **ServiceUnavailableError**: Business Central service issues

## Frontend Implementation

### Error Handling Utility

The shared error handling utility (`src/utils/erpErrorHandling.ts`) provides:

```typescript
// Display detailed error messages
showErpError(error: ErpError, operation: string, options?)

// Extract error information from API responses
extractErpError(error: any, operation: string): ErpError

// Check if an error is retryable
isRetryableError(errorType?: string): boolean

// Get retry delay based on error type
getRetryDelay(errorType?: string, attempt: number): number
```

### Custom Hooks

#### useLineErpOperations

```typescript
const { addLineToErp, checkErpStatus, isLoading } = useLineErpOperations();

// Usage
const result = await addLineToErp(ligneId, ligneTitle);
if (!result.success) {
  // Error is automatically displayed with detailed information
  console.log('Error type:', result.errorType);
}
```

#### useDocumentErpOperations

```typescript
const { 
  archiveDocumentToErp, 
  createDocumentLinesInErp, 
  isLoading 
} = useDocumentErpOperations();

// Usage
const result = await archiveDocumentToErp(documentId, documentKey);
if (result.success) {
  console.log('ERP Document Code:', result.value);
}
```

## Error Message Examples

### Network Error
- **Title**: "Connection Error"
- **Message**: "Unable to connect to Business Central ERP system"
- **Help**: "Please check your internet connection and try again"
- **Actions**: 
  - Check internet connection
  - Verify VPN connection if required
  - Try again in a few moments

### Validation Error
- **Title**: "Data Validation Error"
- **Message**: "The specified item does not exist in Business Central"
- **Help**: "Please verify all data is complete and valid"
- **Actions**:
  - Verify all required fields are filled
  - Check that item/account codes exist in Business Central
  - Ensure dates are within valid ranges

### Authentication Error
- **Title**: "Authentication Failed"
- **Message**: "Authentication failed with Business Central"
- **Help**: "Please contact your administrator to check ERP credentials"
- **Actions**:
  - Contact your system administrator
  - Verify Business Central credentials are configured
  - Check if your account has ERP access

## Testing the Error Handling

### ErpOperationsTestPanel Component

A test panel component (`ErpOperationsTestPanel.tsx`) is available for testing error scenarios:

```typescript
<ErpOperationsTestPanel
  documentId={123}
  documentKey="DOC001"
  ligneId={456}
  ligneTitle="Line Item 1"
  isVisible={true}
/>
```

Features:
- **Real Operations**: Test actual ERP operations
- **Error Simulation**: Simulate different error types
- **Results History**: View recent operation results
- **Visual Feedback**: Success/error indicators

### Test Scenarios

1. **Archive Document**: Test document archival to Business Central
2. **Create Lines**: Test document line creation
3. **Add Line to ERP**: Test individual line creation
4. **Simulate Errors**: Test various error conditions

## Best Practices

### For Developers

1. **Always use the shared hooks** for ERP operations
2. **Don't duplicate error handling logic** - use the shared utilities
3. **Include context** when calling error handling functions
4. **Log errors appropriately** for debugging
5. **Test error scenarios** during development

### For Users

1. **Read error messages carefully** - they contain specific guidance
2. **Follow suggested actions** provided in error messages
3. **Contact support** if problems persist after following guidance
4. **Note error codes** when reporting issues to support

## Configuration

### Environment Variables

The error handling system respects the following configuration:
- Network timeout settings
- Retry attempt limits
- Error message display duration
- Debug mode for detailed logging

### Customization

Error messages and suggestions can be customized by:
1. Updating the error type mappings in `erpErrorHandling.ts`
2. Modifying the help text for specific error types
3. Adjusting retry logic and timing

## Troubleshooting

### Common Issues

1. **No error messages appearing**
   - Ensure `sonner` toast provider is configured
   - Check console for JavaScript errors

2. **Generic error messages**
   - Verify backend is returning structured error responses
   - Check API endpoint error handling

3. **Network errors not properly detected**
   - Review fetch error handling in hooks
   - Ensure proper error type classification

### Debug Mode

Enable debug mode by setting the environment variable:
```
REACT_APP_ERP_DEBUG=true
```

This will:
- Log detailed error information to console
- Show technical error details in UI
- Include additional debugging information

## Migration Guide

### Updating Existing Components

1. **Replace manual error handling**:
   ```typescript
   // Old way
   try {
     const response = await fetch('/api/erp-operation');
     if (!response.ok) {
       toast.error('Operation failed');
     }
   } catch (error) {
     toast.error('Network error');
   }

   // New way
   const result = await addLineToErp(ligneId, title);
   // Error handling is automatic with detailed messages
   ```

2. **Use structured error responses**:
   ```typescript
   // Access error details if needed
   if (!result.success) {
     console.log('Error type:', result.errorType);
     console.log('Technical details:', result.errorDetails);
   }
   ```

3. **Implement retry logic**:
   ```typescript
   import { isRetryableError, getRetryDelay } from '@/utils/erpErrorHandling';

   if (!result.success && isRetryableError(result.errorType)) {
     const delay = getRetryDelay(result.errorType, attemptNumber);
     // Implement retry after delay
   }
   ```

## Support

For issues with the ERP error handling system:
1. Check this documentation first
2. Review console logs for technical details
3. Test with the ErpOperationsTestPanel component
4. Contact the development team with specific error types and contexts 