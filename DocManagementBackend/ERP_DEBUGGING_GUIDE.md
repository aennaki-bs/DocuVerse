# ERP Integration Debugging Guide

## Issue Analysis

The "add line to ERP" functionality is failing with a 500 Internal Server Error. The error message "Failed to add line to ERP. Please check server logs for details." indicates that the Business Central API call is not succeeding.

## Improvements Made

### 1. Enhanced Console Logging
- **Color-coded console output**: 
  - **Yellow**: Info messages (API calls, configuration)
  - **Green**: Success messages (successful API responses)
  - **Red**: Error messages (API failures, exceptions)
  - **Cyan**: Debug messages (payload details)
  - **Dark Yellow**: Warning messages

### 2. Better Error Handling
- Added detailed exception logging with stack traces
- Added validation for missing items/accounts after loading
- Added payload logging for debugging
- Added request/response header logging

### 3. Diagnostic Endpoints
- **GET `/api/Lignes/test-erp-connection`**: Tests basic connectivity to Business Central
- Enhanced error messages with more context

## Debugging Steps

### Step 1: Test ERP Connection
```bash
GET http://localhost:5000/api/Lignes/test-erp-connection
```
This will test basic connectivity to the Business Central server.

### Step 2: Check Configuration
Verify in `appsettings.json`:
```json
"BcApi": {
  "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
  "Username": "ENNAKI",
  "Password": "Allahislam@12",
  "Domain": "DESKTOP-8FCE015",
  "Workstation": "localhost"
}
```

### Step 3: Verify Line Data
Before calling add-to-erp, check:
1. Document is archived to ERP (`ERPDocumentCode` is not null)
2. Line has a valid element (`ElementId` is not null)
3. Element exists in the database (Item or GeneralAccount)

### Step 4: Check Business Central Service
Ensure Business Central is running and accessible at:
`http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDocLine?company=CRONUS%20France%20S.A.`

## Common Issues and Solutions

### 1. Authentication Issues
- **Symptom**: 401 Unauthorized
- **Solution**: Check username/password/domain in config
- **Check**: NTLM authentication is properly configured

### 2. Service Unavailable
- **Symptom**: Connection timeout or refused
- **Solution**: Ensure Business Central service is running on port 25048

### 3. Invalid Payload
- **Symptom**: 400 Bad Request
- **Solution**: Check the payload structure matches BC API expectations
- **Debug**: Look at the colored console output for payload details

### 4. Missing Element Data
- **Symptom**: "Item not found" or "Account not found" errors
- **Solution**: Ensure the ligne.ElementId references a valid Item or GeneralAccount

## How to Use the Enhanced Logging

When you run the add-to-erp operation, you'll now see color-coded console output:

1. **Blue/Cyan**: Payload construction details
2. **Yellow**: API call information
3. **Green**: Success responses
4. **Red**: Errors and exceptions

Look for red error messages to identify the specific failure point.

## Testing the Fix

1. Start the backend application
2. Try to add a line to ERP
3. Monitor the console for colored output
4. If still failing, use the diagnostic endpoint first
5. Check Business Central logs if authentication/service issues persist

## Next Steps if Still Failing

1. Verify Business Central OData service is properly configured
2. Check if the API endpoint URL is correct
3. Test with a simple HTTP client (Postman) to isolate the issue
4. Review Business Central permissions for the user account 