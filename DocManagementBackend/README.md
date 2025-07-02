# DocuVerse - Document Management Backend

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/download)
[![Entity Framework Core](https://img.shields.io/badge/Entity%20Framework%20Core-9.0-green.svg)](https://docs.microsoft.com/en-us/ef/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-red.svg)](https://www.microsoft.com/en-us/sql-server)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

A comprehensive document management system backend built with .NET 9.0, featuring advanced workflow management, ERP integration, and real-time document processing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [ERP Integration](#erp-integration)
- [Project Structure](#project-structure)
- [Services](#services)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

DocuVerse Backend is a powerful document management system that provides comprehensive document lifecycle management with integrated Business Central ERP operations. The system handles complex approval workflows, circuit-based document processing, and seamless data synchronization with external systems.

### Key Capabilities

- **Document Lifecycle Management**: Complete document workflow from creation to archival
- **Circuit-Based Approvals**: Multi-level approval workflows with customizable circuits
- **ERP Integration**: Seamless integration with Microsoft Dynamics 365 Business Central
- **Real-time Synchronization**: Background services for automatic data sync
- **Advanced Security**: JWT-based authentication with role-based access control
- **Audit Trail**: Comprehensive logging and document history tracking

## ✨ Features

### Core Document Management
- ✅ Document creation, editing, and versioning
- ✅ Multi-type document support with customizable subtypes
- ✅ Advanced document search and filtering
- ✅ Bulk document operations
- ✅ Document templating system
- ✅ File attachment management
- ✅ Document expiration and archival

### Workflow & Approval System
- ✅ Circuit-based approval workflows
- ✅ Multi-level approval chains
- ✅ Parallel and sequential approval paths
- ✅ Approval delegation and escalation
- ✅ Custom approval rules and conditions
- ✅ Real-time notification system
- ✅ Approval history and audit trails

### ERP Integration
- ✅ Business Central document archival
- ✅ Line-by-line ERP synchronization
- ✅ Automatic code generation
- ✅ Error handling and retry mechanisms
- ✅ Transaction rollback capabilities
- ✅ ERP status monitoring

### User Management
- ✅ Role-based access control (RBAC)
- ✅ Responsibility center assignments
- ✅ User profile management
- ✅ Authentication with JWT tokens
- ✅ Password policies and security
- ✅ User activity tracking

### API & Integration
- ✅ RESTful API design
- ✅ OpenAPI/Swagger documentation
- ✅ Background service workers
- ✅ Automated data synchronization
- ✅ Webhook support
- ✅ Third-party integrations

## 🛠 Technology Stack

### Backend Framework
- **Core**: .NET 9.0 ASP.NET Core
- **Database**: SQL Server with Entity Framework Core 9.0
- **Authentication**: JWT Bearer tokens
- **API Documentation**: Swagger/OpenAPI 3.0

### Dependencies
```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="DotNetEnv" Version="3.1.1" />
<PackageReference Include="FirebaseAdmin" Version="3.1.0" />
<PackageReference Include="Google.Apis.Auth" Version="1.69.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.2" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="9.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.2" />
<PackageReference Include="RestSharp" Version="112.1.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
```

### External Integrations
- **Microsoft Dynamics 365 Business Central**: Document archival and ERP operations
- **Firebase**: (Optional) Authentication and notifications
- **NTLM Authentication**: For Business Central API access

## 🏗 Architecture

### Layered Architecture
```
┌─────────────────────────────┐
│     Presentation Layer      │  Controllers, API Endpoints
├─────────────────────────────┤
│    Business Logic Layer     │  Services, Workflows
├─────────────────────────────┤
│    Data Access Layer        │  Entity Framework, Repositories
├─────────────────────────────┤
│   External Integration      │  ERP Clients, API Sync
└─────────────────────────────┘
```

### Core Components

#### Controllers (24 Controllers)
- **AccountController**: User account management
- **AdminController**: Administrative operations
- **DocumentsController**: Document CRUD operations
- **WorkflowController**: Workflow and circuit management
- **ApprovalController**: Approval process management
- **ApiSyncController**: Background synchronization control

#### Services (9 Services)
- **DocumentWorkflowService**: Document lifecycle management
- **DocumentErpArchivalService**: ERP integration operations
- **CircuitManagementService**: Approval circuit logic
- **ApiSyncService**: Data synchronization with external APIs
- **UserAuthorizationService**: Permission and access control

#### Models & DTOs
- **Core Entities**: 20+ models including Document, User, Circuit, Status
- **DTOs**: Dedicated data transfer objects for API communication
- **Workflow Models**: Approval, Action, Step entities

## ⚙️ Installation

### Prerequisites

- .NET 9.0 SDK or later
- SQL Server 2019 or later (Express edition supported)
- Visual Studio 2022 or VS Code with C# extension
- Git for version control

### Clone Repository

```bash
git clone https://github.com/your-org/docuverse.git
cd docuverse/DocManagementBackend
```

### Restore Dependencies

```bash
dotnet restore
```

### Build Project

```bash
dotnet build
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ISSUER=DocuVerse-API
AUDIENCE=DocuVerse-Clients

# Database Connection
CONNECTION_STRING=Server=localhost;Database=DocManagementDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=true;

# Business Central API
BC_USERNAME=your_bc_username
BC_PASSWORD=your_bc_password
BC_DOMAIN=your_domain
BC_WORKSTATION=localhost

# Optional: Firebase
FIREBASE_PROJECT_ID=your-firebase-project
```

### Application Settings

Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DocManagementDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=true;"
  },
  "JwtSettings": {
    "ExpiryMinutes": 180
  },
  "ApiSync": {
    "CheckIntervalMinutes": 1,
    "DefaultPollingIntervalMinutes": 60
  },
  "BcApi": {
    "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
    "Domain": "your_domain",
    "Workstation": "localhost"
  }
}
```

### Development Settings

For development, use `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "DocManagementBackend": "Debug"
    }
  }
}
```

## 🗄 Database Setup

### Initial Migration

```bash
# Add initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### Data Seeding

The application automatically seeds initial data on startup including:
- Default admin user
- Document types and statuses
- Basic workflow circuits
- Reference data (responsibilities centers, roles)

### Sample Data Setup

```bash
# The seeder runs automatically on application start
# Check DataSeeder.cs for seeded data details
```

## 📚 API Documentation

### Swagger/OpenAPI

When running in development mode, access the interactive API documentation at:
```
https://localhost:5001/swagger
```

### Authentication

All protected endpoints require JWT Bearer token authentication:

```http
Authorization: Bearer {your-jwt-token}
```

### Core API Endpoints

#### Authentication
```http
POST /api/Auth/login
POST /api/Auth/register
POST /api/Auth/refresh-token
```

#### Document Management
```http
GET    /api/Documents              # Get all documents
GET    /api/Documents/{id}         # Get document by ID
POST   /api/Documents              # Create new document
PUT    /api/Documents/{id}         # Update document
DELETE /api/Documents/{id}         # Delete document
```

#### Workflow Operations
```http
GET    /api/Workflow/circuits           # Get all circuits
POST   /api/Workflow/assign-circuit     # Assign circuit to document
POST   /api/Workflow/process-step       # Process workflow step
GET    /api/Workflow/document/{id}/history  # Get document workflow history
```

#### Approval Management
```http
GET    /api/Approval/pending              # Get pending approvals
POST   /api/Approval/approve/{id}         # Approve document
POST   /api/Approval/reject/{id}          # Reject document
GET    /api/Approval/history/{documentId} # Get approval history
```

#### Admin Operations
```http
GET    /api/Admin/users                # Get all users
POST   /api/Admin/users               # Create user
PUT    /api/Admin/users/{id}          # Update user
DELETE /api/Admin/users/{id}          # Delete user
```

### Request/Response Examples

#### Create Document
```http
POST /api/Documents
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Purchase Request",
  "content": "Requesting office supplies",
  "typeId": 1,
  "subTypeId": 2,
  "docDate": "2024-01-15",
  "comptableDate": "2024-01-15",
  "documentExterne": "PR-2024-001",
  "responsibilityCentreId": 1
}
```

#### Response
```json
{
  "id": 123,
  "documentKey": "DOC-2024-001",
  "title": "Purchase Request",
  "status": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": {
    "id": 1,
    "email": "user@company.com",
    "fullName": "John Doe"
  }
}
```

## 🔗 ERP Integration

### Business Central Integration

The system integrates with Microsoft Dynamics 365 Business Central for document archival and line operations.

#### Features
- **Document Archival**: Automatic archival of completed documents
- **Line Synchronization**: Individual line item creation in BC
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Status Tracking**: Real-time status updates

#### Configuration

```json
{
  "BcApi": {
    "BaseUrl": "http://localhost:25048/BC250/api/bslink/docverse/v1.0",
    "Username": "bc_username",
    "Password": "bc_password",
    "Domain": "your_domain",
    "Workstation": "localhost"
  }
}
```

#### API Endpoints Used
- `POST /api/journal` - Document creation
- `POST /api/journalLine` - Line creation
- `GET /api/items` - Item synchronization
- `GET /api/accounts` - General accounts sync

### API Synchronization

Background service automatically synchronizes reference data:

#### Supported Endpoints
1. **Items**: Product/service catalog
2. **General Accounts**: Chart of accounts
3. **Customers**: Customer master data
4. **Vendors**: Vendor master data

#### Sync Configuration
```bash
# Manual sync via API
POST /api/apisync/sync/all
POST /api/apisync/sync/items
POST /api/apisync/sync/customers
```

## 📁 Project Structure

```
DocManagementBackend/
├── Controllers/                    # API Controllers (24 files)
│   ├── AccountController.cs        # User accounts
│   ├── AdminController.cs          # Administration
│   ├── DocumentsController.cs      # Document management
│   ├── WorkflowController.cs       # Workflow operations
│   ├── ApprovalController.cs       # Approval processes
│   └── ...
├── Services/                       # Business Logic Services
│   ├── DocumentWorkflowService.cs  # Document lifecycle
│   ├── DocumentErpArchivalService.cs # ERP integration
│   ├── CircuitManagementService.cs # Approval circuits
│   ├── ApiSyncService.cs           # Data synchronization
│   └── ...
├── Models/                         # Entity Models
│   ├── document.cs                 # Document entity
│   ├── user.cs                     # User entity
│   ├── circuit.cs                  # Workflow circuit
│   ├── approval.cs                 # Approval entity
│   └── ...
├── ModelsDtos/                     # Data Transfer Objects
│   ├── DocumentDtos.cs             # Document DTOs
│   ├── AccountDtos.cs              # User account DTOs
│   └── ...
├── Data/                           # Data Access Layer
│   ├── ApplicationDbContext.cs     # EF DbContext
│   └── DataSeeder.cs               # Initial data seeding
├── Migrations/                     # Database Migrations
├── utils/                          # Utility Classes
│   ├── AuthHelper.cs               # Authentication utilities
│   ├── GeneratePassword.cs         # Password generation
│   └── ...
├── wwwroot/                        # Static Files
│   └── images/                     # User profile images
├── docs/                           # Documentation
│   ├── BACKEND_DOCUMENTATION.md    # Detailed technical docs
│   ├── API_Examples.md             # API usage examples
│   └── API_SYNC_DOCUMENTATION.md   # Sync service docs
├── Program.cs                      # Application entry point
├── appsettings.json               # Configuration
└── DocManagementBackend.csproj    # Project file
```

## 🔧 Services

### Document Workflow Service
Manages the complete document lifecycle including circuit assignment, step processing, and status transitions.

**Key Methods:**
- `ProcessWorkflowStepAsync()`: Process a workflow step
- `AssignCircuitToDocumentAsync()`: Assign approval circuit
- `GetDocumentWorkflowHistoryAsync()`: Retrieve workflow history

### ERP Archival Service
Handles integration with Business Central for document archival and line operations.

**Key Methods:**
- `ArchiveDocumentToErpAsync()`: Archive document to ERP
- `CreateDocumentLinesInErpAsync()`: Create document lines
- `IsDocumentArchived()`: Check archival status

### Circuit Management Service
Manages approval circuits, steps, and transitions.

**Key Methods:**
- `CreateCircuitAsync()`: Create new approval circuit
- `UpdateCircuitAsync()`: Update circuit configuration
- `GetAvailableActionsForStep()`: Get possible actions

### API Sync Service
Background service for synchronizing reference data with external systems.

**Key Methods:**
- `SyncAllEndpointsAsync()`: Sync all configured endpoints
- `SyncItemsAsync()`: Sync items from BC
- `SyncCustomersAsync()`: Sync customer data

## 💻 Development

### Running the Application

```bash
# Development mode
dotnet run

# With hot reload
dotnet watch run

# Production mode
dotnet run --environment Production
```

### Development Tools

#### Entity Framework Commands
```bash
# Add migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Generate script
dotnet ef migrations script
```

#### Testing Commands
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "TestMethodName"
```

### Code Style and Standards

#### Naming Conventions
- **Controllers**: PascalCase ending with "Controller"
- **Services**: PascalCase ending with "Service"
- **Models**: PascalCase
- **DTOs**: PascalCase ending with "Dto"
- **Methods**: PascalCase with descriptive names
- **Variables**: camelCase

#### Best Practices
- Use dependency injection for all services
- Implement async/await for all I/O operations
- Include comprehensive error handling
- Add XML documentation for public APIs
- Follow SOLID principles
- Use DTOs for API communication

### Debugging

#### Enable Detailed Logging
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

#### Common Debug Scenarios
1. **Database Connection Issues**: Check connection string and SQL Server status
2. **JWT Token Problems**: Verify secret key and token expiration
3. **ERP Integration Failures**: Check BC API connectivity and credentials
4. **Workflow Issues**: Review circuit configuration and step definitions

## 🧪 Testing

### Test Structure
```
DocManagementBackend.Tests/
├── Controllers/            # Controller tests
├── Services/              # Service tests
├── Models/                # Model tests
├── Integration/           # Integration tests
└── Utilities/             # Test utilities
```

### Running Tests

```bash
# All tests
dotnet test

# Unit tests only
dotnet test --filter Category=Unit

# Integration tests only
dotnet test --filter Category=Integration

# With coverage report
dotnet test --collect:"XPlat Code Coverage" --results-directory:"./TestResults"
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization testing

## 🚀 Deployment

### Production Deployment

#### 1. Environment Preparation
```bash
# Install .NET 9.0 Runtime
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y aspnetcore-runtime-9.0
```

#### 2. Database Setup
```bash
# Update production database
dotnet ef database update --environment Production
```

#### 3. Application Configuration
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "your-production-connection-string"
  }
}
```

#### 4. Publish Application
```bash
# Publish for production
dotnet publish -c Release -o ./publish

# Copy to server
scp -r ./publish user@server:/path/to/app
```

#### 5. Service Configuration (systemd)
```ini
[Unit]
Description=DocuVerse Backend API
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /path/to/app/DocManagementBackend.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=docuverse-backend
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["DocManagementBackend.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DocManagementBackend.dll"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  docuverse-backend:
    build: .
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=db;Database=DocManagementDB;User=sa;Password=YourPassword;
    depends_on:
      - db
  
  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword
    ports:
      - "1433:1433"
```

### Performance Optimization

#### Application Settings
```json
{
  "Kestrel": {
    "Limits": {
      "MaxConcurrentConnections": 100,
      "MaxRequestBodySize": 10485760
    }
  }
}
```

#### Caching Configuration
```csharp
// Add to Program.cs
builder.Services.AddMemoryCache();
builder.Services.AddResponseCaching();
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes**: Follow coding standards
4. **Add tests**: Ensure adequate test coverage
5. **Commit changes**: Use conventional commit messages
6. **Push branch**: `git push origin feature/new-feature`
7. **Create Pull Request**: Provide detailed description

### Commit Message Format
```
type(scope): description

feat(auth): add JWT refresh token functionality
fix(workflow): resolve circuit assignment bug
docs(api): update authentication documentation
```

### Code Review Process
- All changes require pull request approval
- Automated tests must pass
- Code coverage should not decrease
- Follow established coding standards

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failures
```bash
# Check SQL Server status
sudo systemctl status mssql-server

# Test connection
sqlcmd -S localhost -U sa -P YourPassword
```

#### 2. JWT Authentication Issues
- Verify JWT_SECRET is set correctly
- Check token expiration settings
- Ensure HTTPS in production

#### 3. ERP Integration Problems
- Verify Business Central API connectivity
- Check NTLM authentication credentials
- Review firewall and network settings

#### 4. Background Service Issues
```bash
# Check service logs
journalctl -u docuverse-backend -f

# Restart service
sudo systemctl restart docuverse-backend
```

### Logging and Monitoring

#### Application Insights Integration
```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-instrumentation-key"
  }
}
```

#### Health Checks
```http
GET /health
GET /health/ready
GET /health/live
```

### Support Resources

- **Documentation**: `/docs` folder
- **API Reference**: Swagger UI at `/swagger`
- **Issue Tracking**: GitHub Issues
- **Community Support**: Project discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support and questions:
- **Email**: support@docuverse.com
- **Documentation**: [docs/](docs/)
- **GitHub Issues**: [Create an issue](https://github.com/your-org/docuverse/issues)

---

**DocuVerse Backend** - Empowering Document Management with Advanced Workflow Capabilities 