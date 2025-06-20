# Add Line to ERP Button Implementation

## Overview
This implementation provides a button that allows users to add individual document lines to Business Central ERP. The button is intelligently disabled based on the document and line status.

## Features

### ✅ **Smart Button States**
- **Active**: Line can be added to ERP (green button)
- **Disabled**: Various reasons with specific messaging
- **Success**: Line already in ERP (shows ERP line code badge)
- **Loading**: Shows spinner during API calls

### 🔒 **Automatic Disabling Conditions**
1. **Document not archived**: Document must be archived to ERP first
2. **Line already in ERP**: Shows success badge instead of button
3. **Missing element**: Line must have a valid Item or Account assigned
4. **No permissions**: User must have FullUser or Admin role

## Backend Implementation

### 📡 **API Endpoints**

#### 1. Add Line to ERP
```
POST /api/Lignes/{id}/add-to-erp
```
- **Authorization**: Admin, FullUser
- **Response**: Success message with ERP line code
- **Error handling**: Detailed error messages for different scenarios

#### 2. Check ERP Status
```
GET /api/Lignes/{id}/can-add-to-erp
```
- **Authorization**: Any authenticated user
- **Response**: Status object with `canAddToErp` flag and reason

### 🔧 **Backend Code Structure**

#### LigneController.cs
```csharp
[HttpPost("{id}/add-to-erp")]
public async Task<IActionResult> AddLineToErp(int id)

[HttpGet("{id}/can-add-to-erp")]
public async Task<IActionResult> CanAddLineToErp(int id)

private object BuildErpLinePayload(Ligne ligne)
private async Task<string?> CallBusinessCenterLineApi(object payload)
```

## Frontend Implementation

### 🎨 **React Components**

#### 1. AddLineToErpButton.tsx
```tsx
interface AddLineToErpButtonProps {
  ligneId: number;
  ligneTitle: string;
  documentErpCode?: string;
  lineErpCode?: string;
  onSuccess?: (erpLineCode: string) => void;
  className?: string;
}
```

#### 2. useLineErpOperations.ts (Hook)
```tsx
const useLineErpOperations = () => {
  const addLineToErp: (ligneId: number, ligneTitle: string) => Promise<ErpOperationResult>
  const checkErpStatus: (ligneId: number) => Promise<ErpStatus | null>
  const isLoading: boolean
}
```

### 🔗 **Integration in LigneItem.tsx**
```tsx
<AddLineToErpButton
  ligneId={ligne.id}
  ligneTitle={ligne.title}
  documentErpCode={document.erpDocumentCode}
  lineErpCode={ligne.erpLineCode}
  onSuccess={(erpLineCode) => {
    ligne.erpLineCode = erpLineCode;
  }}
  className="h-8"
/>
```

## Visual States

### 🟢 **Can Add to ERP**
```
[📤 Add to ERP]  (Green button)
```

### 🔴 **Cannot Add - Document Not Archived**
```
[⚠️ Add to ERP]  (Disabled, tooltip: "Document must be archived to ERP first")
```

### 🔴 **Cannot Add - Missing Element**
```
[⚠️ Add to ERP]  (Disabled, tooltip: "Line must have a valid Item or Account")
```

### ✅ **Already in ERP**
```
[✅ In ERP: 1000]  (Success badge showing ERP line code)
```

### ⏳ **Loading**
```
[🔄 Add to ERP]  (Disabled with spinner)
```

## Testing Scenarios

### Scenario 1: Line Ready for ERP
- **Setup**: Document archived, line has element, not in ERP yet
- **Expected**: Green "Add to ERP" button
- **Action**: Click button → Success toast → Badge appears

### Scenario 2: Document Not Archived
- **Setup**: Document not archived to ERP
- **Expected**: Disabled button with tooltip
- **Action**: Hover shows "Document must be archived to ERP first"

### Scenario 3: Line Already in ERP
- **Setup**: Line has `erpLineCode` populated
- **Expected**: Success badge showing ERP line code
- **Action**: No button, just badge display

### Scenario 4: Missing Element
- **Setup**: Line created without Item or Account
- **Expected**: Disabled button with tooltip
- **Action**: Hover shows "Line must have a valid Item or Account"

## API Request/Response Examples

### Successful Addition Request:
```http
POST /api/Lignes/123/add-to-erp
Authorization: Bearer {token}
```

### Successful Response:
```json
{
  "message": "Line successfully added to ERP",
  "ligneId": 123,
  "erpLineCode": "1000",
  "success": true
}
```

### Status Check Request:
```http
GET /api/Lignes/123/can-add-to-erp
Authorization: Bearer {token}
```

### Status Check Response:
```json
{
  "ligneId": 123,
  "canAddToErp": true,
  "reason": "",
  "message": "",
  "documentErpCode": "SO001",
  "lineErpCode": null,
  "hasElement": true
}
```

### Error Response (Document Not Archived):
```json
{
  "message": "Document must be archived to ERP first before adding lines",
  "canAddToErp": false,
  "reason": "document_not_archived"
}
```

## Business Logic Validation

### Pre-Add Validations:
1. ✅ Document exists
2. ✅ Document is archived to ERP (`ERPDocumentCode` not null)
3. ✅ Line not already in ERP (`ERPLineCode` is null)
4. ✅ Line has valid element (`ElementId` not null)
5. ✅ User has proper permissions

### ERP Payload Construction:
```json
{
  "tierTYpe": 1,           // From document tier type
  "docType": 1,            // From document type number
  "docNo": "SO001",        // From document ERP code
  "type": 2,               // 1=Account, 2=Item
  "codeLine": "ITEM001",   // From line element ID
  "descriptionLine": "Sample Item",
  "locationCode": "MAIN",  // For Items only
  "qty": 5,
  "uniteOfMeasure": "PCS", // For Items only
  "unitpriceCOst": 100.00,
  "discountAmt": 5.00
}
```

## Security & Permissions

### Role-Based Access:
- **View Status**: All authenticated users
- **Add to ERP**: Admin, FullUser roles only
- **API Key**: Uses application NTLM credentials for BC API

## Error Handling

### Frontend Toast Messages:
- ✅ **Success**: "Line 'Title' successfully added to ERP"
- ❌ **Error**: "Failed to add line to ERP" with specific reason
- ⚠️ **Warning**: Various disabled state tooltips

### Backend Error Responses:
- 404: Line not found
- 400: Business validation errors (detailed reasons)
- 500: Technical errors (BC API failures)

## Performance Considerations

### Optimization Features:
- **Status Caching**: Button state cached until props change
- **Lazy Loading**: Status checked only when component mounts
- **Immediate UI Update**: Button state updates immediately after success
- **Debouncing**: Prevents multiple rapid clicks during loading

## Future Enhancements

### Potential Improvements:
1. **Bulk Addition**: Add multiple lines at once
2. **Retry Mechanism**: Automatic retry for failed additions
3. **Real-time Sync**: WebSocket updates for ERP status changes
4. **Progress Indicator**: More detailed progress for large operations
5. **Audit Trail**: Track who added lines and when 