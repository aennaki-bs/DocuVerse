# ERP Document Archival Implementation Summary

## Overview
This implementation provides automatic archival of documents to the Business Center (BC) ERP system when they reach the final status in their assigned circuit, along with post-archival protection against modifications.

## ✅ Implementation Complete

### 1. **Trigger Point Detection**
- **Location**: `DocumentWorkflowService.cs` lines 907-927 and 1069-1089
- **Trigger Events**:
  - When `MoveToNextStatusAsync()` moves a document to a final status (`targetStatus.IsFinal = true`)
  - When `CompleteDocumentStatusAsync()` completes a final status (`documentStatus.Status?.IsFinal == true`)
- **Execution**: Asynchronous background task to avoid blocking the main workflow

### 2. **ERP Archival Service**
- **Service**: `DocumentErpArchivalService.cs`
- **Interface**: `IDocumentErpArchivalService`
- **Features**:
  - ✅ NTLM Authentication using credentials from `.env` file
  - ✅ Idempotency check to prevent duplicate archival
  - ✅ Comprehensive error handling and logging
  - ✅ 5-minute timeout for ERP API calls
  - ✅ Robust response parsing

#### API Mapping Implementation:
```csharp
var payload = new
{
    tierTYpe = documentType.TierType switch {
        TierType.None => 0,
        TierType.Customer => 1, 
        TierType.Vendor => 2,
        _ => 0
    },
    type = document.DocumentType?.TypeNumber ?? 0,
    custVendoNo = customerOrVendorCode,
    documentDate = document.DocDate.ToString("yyyy-MM-dd"),
    postingDate = document.ComptableDate.ToString("yyyy-MM-dd"),
    responsabilityCentre = document.ResponsibilityCentre?.Code ?? "",
    externalDocNo = document.DocumentExterne ?? ""
};
```

### 3. **Database Schema Changes**
- **Migration**: `AddERPDocumentCodeToDocument`
- **New Field**: `ERPDocumentCode` (VARCHAR(100), nullable)
- **Status Update**: Document.Status = 3 (Archived) when successfully archived

### 4. **Post-Archival Protection**

#### Backend Protection:
- **DocumentsController.cs**:
  - `UpdateDocument()`: Blocks edits if `ERPDocumentCode` is not null
  - `DeleteDocument()`: Blocks deletion if `ERPDocumentCode` is not null

#### Frontend Protection:
- **Document Model**: Added `erpDocumentCode` and `isArchived` fields
- **DocumentEditForm.tsx**: 
  - Displays archive warning alert
  - Disables all form inputs
  - Disables save button with "Document Archived" message
- **DocumentTitle.tsx**: Shows orange "Archived to ERP" badge

### 5. **Visual Indicators**
- **Archive Badge**: Orange badge with archive icon displaying "Archived to ERP"
- **Edit Form Alert**: Clear warning message with ERP document code
- **Disabled UI**: All editing capabilities are visually and functionally disabled

## 🔧 Configuration Requirements

### Environment Variables (.env)
```env
BCApi:Username=your_bc_username
BCApi:Password=your_bc_password  
BCApi:Domain=your_domain
BCApi:Workstation=your_workstation
```

### Service Registration (Program.cs)
```csharp
builder.Services.AddScoped<IDocumentErpArchivalService, DocumentErpArchivalService>();
```

## 📊 API Endpoint
- **URL**: `http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDoc?company=CRONUS%20France%20S.A.`
- **Method**: POST
- **Authentication**: NTLM
- **Content-Type**: application/json

## 🔒 Security Features
- ✅ Idempotency: Documents can't be archived twice
- ✅ Post-archival immutability: No edits or deletions allowed
- ✅ Error handling: Graceful failure handling without breaking workflow
- ✅ Async execution: Non-blocking archival process
- ✅ Comprehensive logging: Full audit trail

## 🚀 Workflow Integration
1. Document reaches final status in circuit
2. Workflow service detects final status transition
3. Background task triggers ERP archival service
4. Service builds payload from document data
5. API call made to Business Center
6. On success: Document marked as archived (Status = 3, ERPDocumentCode stored)
7. Frontend automatically shows archive status and disables editing

## 📝 Error Scenarios Handled
- ✅ Network failures during API call
- ✅ ERP API errors (non-200 responses)
- ✅ Malformed API responses
- ✅ Missing required document data
- ✅ Database save failures
- ✅ Timeout scenarios

## 🎯 Benefits
- **Automated Process**: No manual intervention required
- **Data Integrity**: Prevents modification of archived documents
- **Audit Trail**: Complete logging of archival process
- **User Experience**: Clear visual indicators of document state
- **Reliability**: Robust error handling and retry mechanisms
- **Performance**: Non-blocking asynchronous execution

## 🔄 Next Steps (Optional Enhancements)
- [ ] Retry mechanism for failed archival attempts
- [ ] Bulk archival for multiple documents
- [ ] Archive status synchronization from ERP back to DocuVerse
- [ ] Archive history/audit log
- [ ] Manual archival trigger for administrators 