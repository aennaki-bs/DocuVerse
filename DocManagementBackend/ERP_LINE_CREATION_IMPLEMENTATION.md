# ERP Document Line Creation Implementation

## Overview
This implementation extends the existing ERP archival functionality to automatically create document lines in Business Central when a document is archived into the ERP system.

## Implementation Details

### 1. Service Layer Enhancement
- **File**: `Services/DocumentErpArchivalService.cs`
- **New Method**: `CreateDocumentLinesInErpAsync(int documentId)`
- **Integration**: Automatically called after successful document archival

### 2. Business Central API Integration
- **Endpoint**: `http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDocLine?company=CRONUS%20France%20S.A.`
- **Method**: POST
- **Content-Type**: application/json

### 3. Data Mapping

#### From Document Table:
```csharp
tierTYpe = document.DocumentType?.TierType switch
{
    TierType.None => 0,
    TierType.Customer => 1,
    TierType.Vendor => 2,
    _ => 0
};
docType = document.DocumentType?.TypeNumber ?? 0;
docNo = document.ERPDocumentCode ?? "";
```

#### From Line Table:
```csharp
type = ligne.LignesElementType?.TypeElement switch
{
    ElementType.GeneralAccounts => 1,  // General Account
    ElementType.Item => 2,             // Item
    _ => 1
};
codeLine = ligne.ElementId ?? "";               // Item code or Account code
descriptionLine = ligne.Title ?? "";           // Line description
locationCode = ligne.LocationCode ?? "";       // For Items only
qty = ligne.Quantity;                          // Line quantity
uniteOfMeasure = ligne.UnitCode ?? ligne.Item?.Unite ?? ""; // Unit of measure
unitpriceCOst = ligne.PriceHT;                 // Unit price excluding tax
discountAmt = ligne.DiscountAmount;            // Total discount amount
```

### 4. API Endpoints

#### Automatic Line Creation
Lines are automatically created when a document is archived via:
```
POST /api/documents/{id}/archive-to-erp
```

#### Manual Line Creation
For testing and troubleshooting:
```
POST /api/documents/{id}/create-lines-in-erp
```

### 5. Database Updates
- **Field**: `Ligne.ERPLineCode` - Stores the ERP line number returned from Business Central
- **Field**: `Ligne.UpdatedAt` - Updated when line is successfully created in ERP

## Testing Instructions

### Prerequisites
1. Business Central server running on `localhost:25048`
2. Valid NTLM credentials configured in `appsettings.json`:
   ```json
   {
     "BCApi": {
       "Username": "your_username",
       "Password": "your_password",
       "Domain": "your_domain",
       "Workstation": "your_workstation"
     }
   }
   ```
3. Document with lines that is not yet archived to ERP

### Test Scenarios

#### Scenario 1: Complete Document Archival with Lines
1. **Create a document** with one or more lines
2. **Archive to ERP** using the existing endpoint:
   ```
   POST /api/documents/{documentId}/archive-to-erp
   ```
3. **Verify results**:
   - Document should have `ERPDocumentCode` populated
   - All lines should have `ERPLineCode` populated
   - Check logs for successful API calls

#### Scenario 2: Manual Line Creation
1. **Ensure document is already archived** (has `ERPDocumentCode`)
2. **Create lines manually**:
   ```
   POST /api/documents/{documentId}/create-lines-in-erp
   ```
3. **Expected response**:
   ```json
   {
     "message": "Document lines successfully processed in ERP",
     "erpDocumentCode": "SO001",
     "totalLines": 3,
     "createdLines": 3,
     "lines": [
       {
         "ligneId": 1,
         "title": "Item ABC",
         "erpLineCode": "1000",
         "isCreated": true
       }
     ]
   }
   ```

#### Scenario 3: Different Line Types
Test with documents containing:
- **Item lines** (type = 2) with location and unit of measure
- **General Account lines** (type = 1) without location

### Error Handling

#### Common Error Scenarios:
1. **Document not found**: Returns 404
2. **Document not archived**: Returns 400 "Document must be archived to ERP first"
3. **No lines**: Returns 400 "Document has no lines to create"
4. **BC API failure**: Returns 500 with error details in logs
5. **Partial failure**: Returns 500 but some lines may be created

#### Logging
All operations are logged with:
- Info level: Successful operations and progress
- Error level: API failures and exceptions
- Debug level: Full request/response payloads

### Request/Response Examples

#### Successful Line Creation Request (to BC):
```json
{
  "tierTYpe": 1,
  "docType": 1,
  "docNo": "SO001",
  "type": 2,
  "codeLine": "ITEM001",
  "descriptionLine": "Sample Item",
  "locationCode": "MAIN",
  "qty": 5,
  "uniteOfMeasure": "PCS",
  "unitpriceCOst": 100.00,
  "discountAmt": 5.00
}
```

#### Expected BC Response:
```json
{
  "value": "1000"
}
```
or simply:
```
"1000"
```

## Validation Rules

### Line Creation Requirements:
1. Document must be archived to ERP (`ERPDocumentCode` not null)
2. Line must have valid `ElementId` (Item code or Account code)
3. For Item types: Location and Unit of Measure are optional
4. Quantity must be > 0
5. Price can be 0 or positive

### Business Central API Requirements:
- Valid tier type (0, 1, or 2)
- Valid document type number
- Valid ERP document code
- Valid line type (1 or 2)
- Valid element code that exists in BC

## Troubleshooting

### Common Issues:
1. **NTLM Authentication**: Ensure credentials are correct and user has BC access
2. **Company Name**: Verify "CRONUS France S.A." company exists in BC
3. **Element Codes**: Ensure Item/Account codes exist in BC
4. **Unit of Measure**: Ensure unit codes are valid in BC
5. **Location Codes**: Ensure location codes exist in BC

### Log Analysis:
- Check application logs for detailed error messages
- Look for "BC Line API call failed" messages
- Verify request payloads in debug logs

## Database Schema Updates

### Ligne Table:
- `ERPLineCode` varchar(100) nullable - Stores BC line number

### DTO Updates:
- Added `ERPLineCode` to `LigneDto`
- Added `ErpLineCreateRequest` and `ErpLineCreateResponse` DTOs

## Future Enhancements

### Potential Improvements:
1. **Batch Processing**: Send multiple lines in a single API call
2. **Retry Mechanism**: Automatic retry for failed line creations
3. **Status Tracking**: More detailed status tracking for line creation
4. **Validation**: Pre-validate codes before sending to BC
5. **Sync Back**: Sync line updates from BC back to DocVerse 