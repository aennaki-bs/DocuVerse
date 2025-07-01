# DocuVerse Backend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [ERP Integration System](#erp-integration-system)
4. [Error Handling Framework](#error-handling-framework)
5. [API Controllers](#api-controllers)
6. [Services](#services)
7. [Models and DTOs](#models-and-dtos)
8. [Database Structure](#database-structure)
9. [Configuration](#configuration)
10. [Best Practices](#best-practices)

## Overview

DocuVerse Backend is a .NET 9.0 ASP.NET Core application that provides comprehensive document management functionality with integrated ERP (Business Central) operations. The system handles document workflows, circuit approvals, and seamless integration with Microsoft Dynamics 365 Business Central for archival and line operations.

### Key Features
- Document lifecycle management with approval circuits
- Circuit-based approval workflows with multi-level authorization
- ERP integration with Business Central for document archival
- Enhanced error handling and user feedback system
- Real-time document status tracking and notifications
- Comprehensive audit trails and logging
- Role-based access control and security

### Technology Stack
- **Framework**: .NET 9.0 ASP.NET Core
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens with role-based authorization
- **ERP Integration**: HTTP REST API calls to Business Central with NTLM authentication
- **Logging**: Structured logging with ILogger
- **Dependency Injection**: Built-in ASP.NET Core DI container
- **Caching**: In-memory caching for performance optimization

## Architecture

### Project Structure
```
DocManagementBackend/
├── Controllers/           # API Controllers
│   ├── DocumentsController.cs
│   ├── LigneController.cs
│   ├── AccountController.cs
│   └── AdminController.cs
├── Services/             # Business logic services
│   ├── DocumentErpArchivalService.cs
│   ├── DocumentWorkflowService.cs
│   ├── ApiSyncService.cs
│   └── BcApiClient.cs
├── Models/               # Entity models
│   ├── Document.cs
│   ├── Ligne.cs
│   ├── User.cs
│   └── Circuit.cs
├── ModelsDtos/           # Data Transfer Objects
│   ├── DocumentDtos.cs
│   ├── LignesDtos.cs
│   └── AccountDtos.cs
├── Data/                 # Entity Framework DbContext
│   ├── ApplicationDbContext.cs
│   └── DataSeeder.cs
├── Migrations/           # Database migrations
├── utils/                # Utility classes
├── wwwroot/              # Static files
└── docs/                 # Documentation
```

### Layered Architecture
- **Presentation Layer**: Controllers handling HTTP requests
- **Business Logic Layer**: Services implementing business rules
- **Data Access Layer**: Entity Framework with repositories
- **External Integration Layer**: ERP and API clients

## ERP Integration System

### Overview
The ERP integration system provides seamless connectivity with Microsoft Dynamics 365 Business Central for document archival and line operations. This system handles the complete lifecycle of document processing from creation to archival.

### Core Components

#### 1. DocumentErpArchivalService
**Location**: `Services/DocumentErpArchivalService.cs`

Primary service responsible for ERP operations:

```csharp
public interface IDocumentErpArchivalService
{
    Task<bool> ArchiveDocumentToErpAsync(int documentId);
    Task<bool> IsDocumentArchived(int documentId);
    Task<bool> CreateDocumentLinesInErpAsync(int documentId);
}
```

**Key Methods:**
- `ArchiveDocumentToErpAsync`: Archives a complete document to Business Central
- `CreateDocumentLinesInErpAsync`: Creates individual document lines in Business Central
- `IsDocumentArchived`: Checks if a document has been archived
- `BuildErpPayload`: Constructs API payload for document creation
- `BuildErpLinePayload`: Constructs API payload for line creation

**Features:**
- Automatic retry mechanisms for transient failures
- Comprehensive error handling with detailed error messages
- Transaction support for data consistency
- Logging and monitoring for operations tracking
- Business Central API error extraction and translation

#### 2. Business Central API Integration

**Authentication**: NTLM Authentication with domain credentials
```csharp
private void ConfigureHttpClient()
{
    var handler = new HttpClientHandler()
    {
        Credentials = new NetworkCredential(_username, _password, _domain),
        PreAuthenticate = true
    };
    
    _httpClient = new HttpClient(handler);
    _httpClient.DefaultRequestHeaders.Add("User-Agent", _workstation);
}
```

**API Endpoints:**
- Document Creation: `POST /api/journal`
- Line Creation: `POST /api/journalLine`

### Document Archival Workflow

1. **Document Completion**: Document reaches final circuit status
2. **Validation**: Check document completeness and required fields
3. **ERP Document Creation**: Create document header in Business Central
4. **Line Processing**: Create individual lines for each document ligne
5. **Status Update**: Update document with ERP codes
6. **Error Handling**: Capture and report any failures with user-friendly messages

### Payload Structures

#### Document Payload
```csharp
var payload = new
{
    tierTYpe = tierType,           // 0=None, 1=Customer, 2=Vendor
    type = documentType,           // Document type number
    custVendoNo = customerCode,    // Customer/Vendor code
    documentDate = "yyyy-MM-dd",   // Document date
    postingDate = "yyyy-MM-dd",    // Posting date
    responsabilityCentre = code,   // Responsibility centre
    externalDocNo = external       // External document number
};
```

#### Line Payload
```csharp
var payload = new
{
    tierTYpe = tierType,
    docType = documentType,
    docNo = erpDocumentCode,
    type = lineType,               // 1=General Account, 2=Item
    codeLine = elementCode,        // Account/Item code
    descriptionLine = title,       // Line description
    qty = quantity,
    uniteOfMeasure = unitCode,
    unitpriceCOst = price,
    discountAmt = discount,
    locationCOde = locationCode
};
```

## Error Handling Framework

### Enhanced Error Response System

The error handling framework provides comprehensive error management with user-friendly feedback and detailed technical information for debugging.

#### ErpOperationResult Model
```csharp
public class ErpOperationResult
{
    public bool IsSuccess { get; set; }
    public string? Value { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public int? StatusCode { get; set; }
    public string? ErrorType { get; set; }
    
    public static ErpOperationResult Success(string value) { /* ... */ }
    public static ErpOperationResult Failure(string errorMessage, /* ... */) { /* ... */ }
}
```

#### Error Types Classification
- **NetworkError**: Connection and timeout issues
- **ValidationError**: Data validation failures
- **AuthenticationError**: Credential problems
- **AuthorizationError**: Permission issues
- **NotFoundError**: Missing resources
- **ServerError**: Business Central internal errors
- **ServiceUnavailableError**: Service availability issues
- **TimeoutError**: Request timeout issues

#### Business Central Error Extraction
```csharp
private string ExtractBusinessCentralError(string responseContent, int statusCode)
{
    try
    {
        var jsonDoc = JsonDocument.Parse(responseContent);
        
        // Extract OData error message
        if (jsonDoc.RootElement.TryGetProperty("error", out var errorElement))
        {
            if (errorElement.TryGetProperty("message", out var messageElement))
            {
                var bcMessage = messageElement.GetString() ?? "";
                return TranslateBusinessCentralMessage(bcMessage, "document creation");
            }
        }
        
        return GetGenericErrorMessage(statusCode, "document creation");
    }
    catch
    {
        return GetGenericErrorMessage(statusCode, "document creation");
    }
}
```

#### Error Message Translation
```csharp
private string TranslateBusinessCentralMessage(string bcMessage, string operation)
{
    // Common Business Central error patterns
    if (bcMessage.Contains("You do not have permission"))
        return $"Access denied for {operation}. Please contact your administrator.";
    
    if (bcMessage.Contains("already exists"))
        return $"A record with this information already exists in the system.";
    
    if (bcMessage.Contains("cannot be found"))
        return $"The referenced item or account could not be found in Business Central.";
    
    // Return original message if no translation available
    return bcMessage;
}
```

### Error Handling Best Practices

1. **Structured Error Responses**: Always return consistent error structure
2. **User-Friendly Messages**: Translate technical errors to actionable user guidance
3. **Error Categorization**: Classify errors for proper handling
4. **Comprehensive Logging**: Log all errors with context for debugging
5. **Graceful Degradation**: Continue operation when possible

## API Controllers

### DocumentsController
**Location**: `Controllers/DocumentsController.cs`

Central controller for document management and ERP operations.

#### Document CRUD Operations
```csharp
[HttpGet]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> GetDocuments(DocumentQueryParameters parameters)

[HttpGet("{id}")]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> GetDocument(int id)

[HttpPost]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> CreateDocument([FromBody] DocumentCreateDto documentDto)

[HttpPut("{id}")]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> UpdateDocument(int id, [FromBody] DocumentUpdateDto documentDto)

[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> DeleteDocument(int id)
```

#### ERP Integration Endpoints
```csharp
[HttpPost("{id}/archive-to-erp")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> ArchiveToErp(int id)

[HttpPost("{id}/create-lines-in-erp")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> ManualErpLineCreation(int id)

[HttpPost("check-erp-status")]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> CheckErpStatus([FromBody] List<int> documentIds)
```

### LigneController
**Location**: `Controllers/LigneController.cs`

Manages document lines and their ERP operations with enhanced error handling.

#### Line Management
```csharp
[HttpGet("document/{documentId}")]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> GetLignesByDocument(int documentId)

[HttpPost]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> CreateLigne([FromBody] LigneCreateDto ligneDto)

[HttpPut("{id}")]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> UpdateLigne(int id, [FromBody] LigneUpdateDto ligneDto)
```

#### ERP Line Operations with Enhanced Error Handling
```csharp
[HttpPost("{id}/add-to-erp")]
[Authorize(Roles = "Admin,FullUser")]
public async Task<IActionResult> CallBusinessCenterLineApi(int id)
{
    var result = await CreateErpLine(ligne);
    
    if (result.IsSuccess)
    {
        return Ok(new { 
            message = "Line successfully added to ERP", 
            erpLineCode = result.Value 
        });
    }
    else
    {
        return StatusCode(500, new { 
            message = result.ErrorMessage ?? "Failed to add line to ERP",
            errorDetails = result.ErrorDetails,
            errorType = result.ErrorType ?? "ErpOperationError",
            statusCode = result.StatusCode
        });
    }
}
```

## Services

### DocumentWorkflowService
**Location**: `Services/DocumentWorkflowService.cs`

Manages document workflow and circuit processing with automatic ERP integration.

#### Key Responsibilities
- Circuit assignment and validation
- Status transitions and approvals
- Approval workflow management
- ERP archival triggers
- Document lifecycle management

#### Automatic ERP Archival
When documents reach final status, automatic archival is triggered:
```csharp
if (targetStatus.IsFinal)
{
    document.IsCircuitCompleted = true;
    document.Status = 2; // Completed status
    
    // Trigger ERP archival asynchronously
    _ = Task.Run(async () =>
    {
        try
        {
            var archivalSuccess = await _erpArchivalService.ArchiveDocumentToErpAsync(documentId);
            if (archivalSuccess)
            {
                _logger.LogInformation("Document {DocumentId} successfully archived to ERP", documentId);
            }
            else
            {
                _logger.LogWarning("Failed to archive document {DocumentId} to ERP", documentId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during ERP archival for document {DocumentId}", documentId);
        }
    });
}
```

### ApiSyncService
**Location**: `Services/ApiSyncService.cs`

Handles external API synchronization for reference data:
- Customer/Vendor synchronization from Business Central
- Item synchronization with inventory data
- General account synchronization for accounting
- Location and unit of measure synchronization

### BcApiClient
**Location**: `Services/BcApiClient.cs`

Dedicated client for Business Central API interactions:
- Authentication management with NTLM
- Request/response handling with retry logic
- Error processing and translation
- Connection pooling and optimization

## Models and DTOs

### Core Entity Models

#### Document Model
```csharp
public class Document
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string DocumentKey { get; set; }
    public string Content { get; set; }
    public int Status { get; set; }
    public DateTime DocDate { get; set; }
    public DateTime ComptableDate { get; set; }
    
    // ERP Integration
    public string? ERPDocumentCode { get; set; }
    public bool IsCircuitCompleted { get; set; }
    
    // Relationships
    public int TypeId { get; set; }
    public DocumentType DocumentType { get; set; }
    public List<Ligne> Lignes { get; set; }
    public int? CircuitId { get; set; }
    public Circuit? Circuit { get; set; }
    
    // Customer/Vendor snapshot
    public string? CustomerVendorCode { get; set; }
    public string? CustomerVendorName { get; set; }
    public string? CustomerVendorAddress { get; set; }
}
```

#### Ligne Model
```csharp
public class Ligne
{
    public int Id { get; set; }
    public string Title { get; set; }
    public decimal Quantity { get; set; }
    public decimal PriceHT { get; set; }
    public decimal DiscountAmount { get; set; }
    
    // ERP Integration
    public string? ERPLineCode { get; set; }
    
    // Element relationships
    public string? ElementId { get; set; }
    public int? LignesElementTypeId { get; set; }
    public LignesElementType? LignesElementType { get; set; }
    
    // Location and unit information
    public string? LocationCode { get; set; }
    public string? UnitCode { get; set; }
}
```

### Data Transfer Objects

#### Enhanced Error DTOs
```csharp
public class ErpLineCreateResponse
{
    public bool IsSuccess { get; set; }
    public string? ErpLineCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public string? ErrorType { get; set; }
    public int? StatusCode { get; set; }
}

public class ErpOperationResult
{
    public bool IsSuccess { get; set; }
    public string? Value { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public int? StatusCode { get; set; }
    public string? ErrorType { get; set; }
}
```

#### Document DTOs
```csharp
public class DocumentCreateDto
{
    public string Title { get; set; }
    public string DocumentAlias { get; set; }
    public string DocumentExterne { get; set; }
    public DateTime DocDate { get; set; }
    public DateTime ComptableDate { get; set; }
    public int TypeId { get; set; }
    public int? SubTypeId { get; set; }
    public int? ResponsibilityCentreId { get; set; }
    public string? CustomerVendorCode { get; set; }
}
```

## Database Structure

### Key Tables

#### Documents Table
Primary table for document storage with ERP integration support:
```sql
CREATE TABLE Documents (
    Id int IDENTITY(1,1) PRIMARY KEY,
    Title nvarchar(max) NOT NULL,
    DocumentKey nvarchar(max) NOT NULL,
    Content nvarchar(max) NOT NULL,
    Status int NOT NULL,
    DocumentAlias nvarchar(max) NOT NULL,
    DocumentExterne nvarchar(max) NOT NULL,
    DocDate datetime2 NOT NULL,
    ComptableDate datetime2 NOT NULL,
    TypeId int NOT NULL,
    SubTypeId int NULL,
    CircuitId int NULL,
    ResponsibilityCentreId int NULL,
    ERPDocumentCode nvarchar(100) NULL,
    IsCircuitCompleted bit NOT NULL DEFAULT 0,
    CreatedAt datetime2 NOT NULL,
    UpdatedAt datetime2 NOT NULL,
    CreatedByUserId int NOT NULL,
    UpdatedByUserId int NULL,
    
    -- Customer/Vendor snapshot fields
    CustomerVendorCode nvarchar(50) NULL,
    CustomerVendorName nvarchar(200) NULL,
    CustomerVendorAddress nvarchar(500) NULL,
    CustomerVendorCity nvarchar(100) NULL,
    CustomerVendorCountry nvarchar(100) NULL
);
```

#### Lignes Table
Document lines with ERP integration:
```sql
CREATE TABLE Lignes (
    Id int IDENTITY(1,1) PRIMARY KEY,
    DocumentId int NOT NULL,
    Title nvarchar(max) NOT NULL,
    Quantity decimal(18,4) NOT NULL,
    PriceHT decimal(18,4) NOT NULL,
    DiscountAmount decimal(18,4) NOT NULL DEFAULT 0,
    ERPLineCode nvarchar(50) NULL,
    ElementId nvarchar(50) NULL,
    LignesElementTypeId int NULL,
    LocationCode nvarchar(50) NULL,
    UnitCode nvarchar(20) NULL,
    CreatedAt datetime2 NOT NULL,
    UpdatedAt datetime2 NOT NULL,
    
    CONSTRAINT FK_Lignes_Documents FOREIGN KEY (DocumentId) REFERENCES Documents(Id)
);
```

### Performance Indexes
```sql
-- ERP Document Code unique index
CREATE UNIQUE INDEX IX_Documents_ERPDocumentCode 
ON Documents(ERPDocumentCode) 
WHERE ERPDocumentCode IS NOT NULL;

-- Document workflow indexes
CREATE INDEX IX_Documents_Status ON Documents(Status);
CREATE INDEX IX_Documents_CircuitId ON Documents(CircuitId);
CREATE INDEX IX_Documents_TypeId ON Documents(TypeId);

-- Line indexes
CREATE INDEX IX_Lignes_DocumentId ON Lignes(DocumentId);
CREATE INDEX IX_Lignes_ERPLineCode ON Lignes(ERPLineCode);
```

## Configuration

### App Settings Structure
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DocuVerse;Integrated Security=true;"
  },
  "BusinessCentralApi": {
    "BaseUrl": "https://your-bc-server/BC200/api/v2.0/",
    "Username": "domain\\username",
    "Password": "your-password",
    "Domain": "your-domain",
    "Workstation": "workstation-name"
  },
  "Jwt": {
    "Key": "your-secret-key-minimum-256-bits",
    "Issuer": "DocuVerse",
    "Audience": "DocuVerse-Users",
    "ExpireMinutes": 1440
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "DocManagementBackend.Services": "Debug"
    }
  }
}
```

### Dependency Injection Setup
```csharp
// Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register services
builder.Services.AddScoped<IDocumentErpArchivalService, DocumentErpArchivalService>();
builder.Services.AddScoped<DocumentWorkflowService>();
builder.Services.AddScoped<ApiSyncService>();
builder.Services.AddHttpClient<BcApiClient>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
```

## Best Practices

### Error Handling
1. **Structured Error Responses**: Always return consistent error structure with proper HTTP status codes
2. **User-Friendly Messages**: Translate technical errors to actionable user guidance
3. **Error Categorization**: Classify errors by type for proper handling
4. **Comprehensive Logging**: Log all errors with correlation IDs and context
5. **Graceful Degradation**: Continue operation when possible, fail safely when not

### Performance
1. **Async/Await Consistently**: Use async patterns for all I/O operations
2. **Database Indexing**: Implement proper indexing strategy for query performance
3. **Pagination**: Use pagination for large data sets
4. **Caching**: Cache frequently accessed reference data
5. **Query Optimization**: Monitor and optimize database queries

### Security
1. **Input Validation**: Validate all input data at API boundaries
2. **Parameterized Queries**: Always use parameterized queries to prevent SQL injection
3. **Authentication/Authorization**: Implement proper JWT-based auth with role checking
4. **Secure Configuration**: Store sensitive data in secure configuration stores
5. **Regular Security Audits**: Conduct regular security reviews and updates

### ERP Integration
1. **Network Resilience**: Handle network failures gracefully with retry mechanisms
2. **Idempotent Operations**: Ensure operations can be safely retried
3. **Correlation IDs**: Use correlation IDs for tracking operations across systems
4. **API Monitoring**: Monitor API usage, success rates, and performance
5. **Error Classification**: Implement proper error categorization for user feedback

This comprehensive documentation covers the DocuVerse backend system with focus on ERP integration and enhanced error handling. For specific implementation details, refer to the source code and inline documentation.

