# API Synchronization Background Service Documentation

## Overview
The API Synchronization Background Service is a comprehensive solution that automatically fetches data from Business Center (BC) API endpoints at configurable intervals and synchronizes it with the local database. The service ensures data consistency by only inserting new records, skipping duplicates based on unique identifiers.

## Features

### ✅ Core Functionality
- **Automated Background Polling**: Runs continuously in the background, checking for scheduled syncs
- **Configurable Intervals**: Each endpoint can have independent polling intervals (minimum 1 minute)
- **Duplicate Prevention**: Only inserts new records, skipping existing ones based on unique identifiers
- **Robust Error Handling**: Continues operation even if individual endpoints fail
- **Comprehensive Logging**: Detailed logging for monitoring and troubleshooting
- **Manual Sync**: Administrators can trigger syncs manually via API endpoints

### 📊 Supported Endpoints
1. **Items** - `http://localhost:25048/BC250/api/bslink/docverse/v1.0/items`
2. **General Accounts** - `http://localhost:25048/BC250/api/bslink/docverse/v1.0/accounts`
3. **Customers** - `http://localhost:25048/BC250/api/bslink/docverse/v1.0/customers`
4. **Vendors** - `http://localhost:25048/BC250/api/bslink/docverse/v1.0/vendors`

## Architecture Components

### 1. Models (`ApiSyncModels.cs`)
- **ApiSyncConfiguration**: Database table for storing sync configurations
- **BcApiResponse<T>**: Generic wrapper for BC API responses
- **DTO Classes**: Data transfer objects for each endpoint type
- **SyncResult**: Result tracking for sync operations

### 2. Services

#### **BcApiClient** (`BcApiClient.cs`)
- Handles HTTP communication with BC API endpoints
- NTLM authentication using environment variables
- Robust error handling and retries
- JSON deserialization with flexible naming policies

#### **ApiSyncService** (`ApiSyncService.cs`)
- Core business logic for data synchronization
- Data mapping between BC API and local database entities
- Duplicate detection and prevention
- Configuration management

#### **ApiSyncBackgroundService** (`ApiSyncBackgroundService.cs`)
- Background service that runs continuously
- Scheduled sync execution based on configuration
- Service lifecycle management

### 3. API Controller (`ApiSyncController.cs`)
- REST endpoints for manual sync operations
- Configuration management endpoints
- Status monitoring and reporting
- Administrative interface

## Data Mapping

### Items Endpoint
| BC API Field | Local DB Field | Description |
|--------------|---------------|-------------|
| `No` | `Code` | Item identifier |
| `Description` | `Description` | Item description |

### General Accounts Endpoint
| BC API Field | Local DB Field | Description |
|--------------|---------------|-------------|
| `No` | `Code` | Account code |
| `Name` | `Description` | Account description |

### Customers Endpoint
| BC API Field | Local DB Field | Description |
|--------------|---------------|-------------|
| `No` | `Code` | Customer code |
| `Name` | `Name` | Customer name |
| `Address` | `Address` | Customer address |
| `City` | `City` | Customer city |
| `Country` | `Country` | Customer country |

### Vendors Endpoint
| BC API Field | Local DB Field | Description |
|--------------|---------------|-------------|
| `No` | `VendorCode` | Vendor identifier |
| `Name` | `Name` | Vendor name |
| `Address` | `Address` | Vendor address |
| `City` | `City` | Vendor city |
| `Country` | `Country` | Vendor country |

## Configuration

### Environment Variables (.env file)
```bash
# Required BC API Authentication
BC_USERNAME=your_bc_username
BC_PASSWORD=your_bc_password
BC_DOMAIN=DESKTOP-8FCE015
BC_WORKSTATION=localhost
```

### Application Settings (appsettings.json)
```json
{
  "ApiSync": {
    "CheckIntervalMinutes": 1,
    "DefaultPollingIntervalMinutes": 60
  },
  "BcApi": {
    "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
    "Username": "",
    "Password": "",
    "Domain": "DESKTOP-8FCE015",
    "Workstation": "localhost"
  }
}
```

### Database Configuration Table
The `ApiSyncConfigurations` table stores individual endpoint settings:
- **EndpointName**: Name identifier for the endpoint
- **ApiUrl**: Full URL of the BC API endpoint
- **PollingIntervalMinutes**: How often to sync (minimum 1 minute)
- **IsEnabled**: Whether the endpoint is active for syncing
- **LastSyncTime**: Timestamp of the last successful sync
- **NextSyncTime**: Calculated next sync time
- **LastSyncStatus**: Status of the last sync attempt
- **Statistics**: Success/failure counters

## API Endpoints

### Configuration Management
```http
GET /api/apisync/configurations
GET /api/apisync/configurations/{id}
PUT /api/apisync/configurations/{id}
PUT /api/apisync/configurations/{endpointName}/interval
POST /api/apisync/initialize
POST /api/apisync/update-all-intervals
```

### Manual Sync Operations
```http
POST /api/apisync/sync/all
POST /api/apisync/sync/items
POST /api/apisync/sync/generalaccounts
POST /api/apisync/sync/customers
POST /api/apisync/sync/vendors
POST /api/apisync/sync/{endpointType}
```

### Status Monitoring
```http
GET /api/apisync/status
```

## Setup Instructions

### 1. Environment Setup
Add the required authentication credentials to your `.env` file:
```bash
BC_USERNAME=your_bc_username
BC_PASSWORD=your_bc_password
BC_DOMAIN=DESKTOP-8FCE015
BC_WORKSTATION=localhost
```

### 2. Service Registration
The services are automatically registered in `Program.cs`:
```csharp
builder.Services.AddApiSyncServices();
```

### 3. Database Migration
Run the migration to create the configuration table:
```bash
dotnet ef migrations add AddApiSyncConfiguration
dotnet ef database update
```

### 4. Service Initialization
The background service automatically initializes default configurations on startup.

## Monitoring and Troubleshooting

### Logging
The service provides comprehensive logging at different levels:
- **Information**: Successful operations and status updates
- **Warning**: Non-critical issues (e.g., individual endpoint failures)
- **Error**: Critical failures requiring attention
- **Debug**: Detailed operation traces

### Key Log Messages
- `"API Sync Background Service started"` - Service startup
- `"Found {Count} API endpoints due for sync"` - Scheduled sync detection
- `"Successfully synced {EndpointName}: {Inserted} inserted, {Skipped} skipped"` - Sync completion
- `"Sync failed for {EndpointName}: {ErrorMessage}"` - Sync failures

### Status Monitoring
Use the status endpoint to monitor service health:
```http
GET /api/apisync/status
```

Response includes:
- Total and enabled endpoint counts
- Last sync times for each endpoint
- Next scheduled sync times
- Success/failure statistics
- Current error messages

## Performance Considerations

### Polling Frequency
- **Items**: 10 minutes (high frequency for inventory changes)
- **GeneralAccounts**: 60 minutes (low frequency for chart of accounts)
- **Customers**: 30 minutes (medium frequency for customer updates)
- **Vendors**: 20 minutes (medium-high frequency for vendor updates)
- **Minimum**: 1 minute (to prevent excessive load)
- **Customizable**: Each endpoint can be configured independently

### Duplicate Prevention
- Uses unique identifiers (Code/VendorCode) to prevent duplicates
- Efficient `FindAsync()` and `FirstOrDefaultAsync()` queries
- Batch operations for better performance

### Error Resilience
- Individual endpoint failures don't affect others
- Automatic retry on next scheduled cycle
- Configuration updates persist error states for monitoring

## Security Considerations

### Authentication
- NTLM authentication for BC API access
- Environment variable storage for credentials
- Secure credential handling in HTTP client

### Authorization
- All API endpoints require authentication (`[Authorize]` attribute)
- Administrative functions protected by role-based access

### Data Validation
- Input validation on all configuration endpoints
- SQL injection prevention through Entity Framework
- Type-safe data mapping

## Extending the Service

### Adding New Endpoints
1. **Create DTO**: Define data transfer object for the new endpoint
2. **Add Enum Value**: Extend `ApiEndpointType` enum
3. **Implement Sync Method**: Add sync logic in `ApiSyncService`
4. **Update Background Service**: Handle new endpoint type
5. **Add API Endpoint**: Create controller method for manual sync

### Custom Data Mapping
Override the internal sync methods to implement custom mapping logic:
```csharp
private async Task SyncCustomEndpointAsync(SyncResult result)
{
    // Custom implementation
}
```

## Troubleshooting Common Issues

### Service Not Starting
- Check environment variables are set correctly
- Verify database connection string
- Ensure migrations have been applied

### Authentication Failures
- Verify BC API credentials in environment variables
- Check network connectivity to BC server
- Confirm NTLM authentication is supported

### Sync Failures
- Check BC API endpoint availability
- Verify data format compatibility
- Review error logs for specific failure reasons

### Performance Issues
- Reduce polling frequency for less critical endpoints
- Monitor database connection pool usage
- Check BC API response times

## Best Practices

### Configuration Management
- Use environment-specific configuration files
- Set appropriate polling intervals based on business needs
- Regularly monitor sync status and statistics

### Monitoring
- Set up log aggregation for production environments
- Create alerts for consecutive sync failures
- Monitor database growth and performance

### Maintenance
- Regularly review and clean up old sync logs
- Update authentication credentials as needed
- Test manual sync operations periodically

---

*This documentation covers the complete API Synchronization Background Service. For technical support or feature requests, please refer to the development team.* 