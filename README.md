# DMBApp - Document Management System

A comprehensive full-stack document management application with workflow automation, circuit management, and multi-user approval systems.

## 🚀 Project Overview

DMBApp is a modern document management system designed for enterprise use, featuring:
- **Document Workflow Management**: Automated approval circuits with sequential and parallel processing
- **User Authentication & Authorization**: JWT-based security with role-based access control
- **Dynamic Line Item System**: Flexible document structure with customizable line elements
- **Multi-language Support**: Internationalization ready
- **Real-time Updates**: Modern reactive UI with optimistic updates
- **API Integration**: RESTful backend with comprehensive API documentation

## 📁 Project Structure

```
DMBApp/
├── DocManagementBackend/          # .NET 9 Web API
│   ├── Controllers/               # API endpoints
│   ├── Models/                    # Domain entities
│   ├── Services/                  # Business logic
│   ├── Data/                      # Entity Framework context
│   ├── Migrations/                # Database migrations
│   └── wwwroot/                   # Static files
├── DocManagementFrontend/         # React + TypeScript frontend
│   ├── src/                       # Source code
│   ├── public/                    # Static assets
│   └── dist/                      # Built application
├── Documentation/                 # Project documentation
└── Database/                      # SQL scripts and backups
```

## 🛠️ Technology Stack

### Backend (.NET 9)
- **Framework**: ASP.NET Core 9.0
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Security**: BCrypt password hashing
- **API Documentation**: Swagger/OpenAPI
- **External Services**: Firebase Admin SDK
- **Containerization**: Docker support

#### Key Dependencies
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.2" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.2" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="FirebaseAdmin" Version="3.1.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
```

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion

#### Key Dependencies
```json
{
  "react": "^18.3.1",
  "typescript": "^5.5.3",
  "vite": "^6.2.4",
  "@tanstack/react-query": "^5.56.2",
  "react-router-dom": "^6.26.2",
  "tailwindcss": "^3.4.11",
  "framer-motion": "^12.11.0"
}
```

## 🚀 Quick Start

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+ and npm
- SQL Server (Local DB or full instance)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DMBApp
   ```

2. **Configure environment variables**
   Create a `.env` file in the `DocManagementBackend` directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   ISSUER=DMBApp
   AUDIENCE=DMBApp-Users
   ConnectionStrings__DefaultConnection=Server=(localdb)\\mssqllocaldb;Database=DMBAppDb;Trusted_Connection=true;
   ```

3. **Setup database**
   ```bash
   cd DocManagementBackend
   rm -rf Migrations
   dotnet ef migrations add InitialDatabase
   dotnet ef database update
   ```

4. **Install dependencies and run**
   ```bash
   dotnet restore
   dotnet build
   dotnet run
   ```

   The API will be available at `https://localhost:7155` with Swagger documentation.

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd DocManagementFrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Backend Container
```bash
cd DocManagementBackend
docker build -t dmbapp-backend .
docker run -p 8080:80 dmbapp-backend
```

### Using Docker Compose
```bash
docker-compose up -d
```

## 📊 Core Features

### Document Management
- **Document Creation**: Create documents with metadata and custom fields
- **Version Control**: Track document versions and changes
- **File Upload**: Support for multiple file types and formats
- **Search & Filter**: Advanced search capabilities across documents

### Workflow System
- **Approval Circuits**: Define custom approval workflows
- **Sequential Processing**: Step-by-step approval chains
- **Parallel Processing**: Multiple approvers at the same stage
- **Dynamic Assignment**: Role-based automatic assignment
- **Status Tracking**: Real-time workflow status updates

### Line Item Management
- **Dynamic Elements**: Flexible line item structure
- **Custom Types**: Configurable element types and properties
- **Validation**: Built-in and custom validation rules
- **Bulk Operations**: Mass edit and update capabilities

### User Management
- **Authentication**: Secure JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **User Profiles**: Comprehensive user management
- **Responsibility Centers**: Organizational structure support

## 🔧 API Documentation

### Key Endpoints

#### Authentication
```http
POST /api/Auth/login
POST /api/Auth/register
POST /api/Auth/refresh-token
```

#### Documents
```http
GET    /api/Documents
POST   /api/Documents
GET    /api/Documents/{id}
PUT    /api/Documents/{id}
DELETE /api/Documents/{id}
```

#### Workflows
```http
GET    /api/Workflows/circuit/{circuitId}
POST   /api/Workflows/start
PUT    /api/Workflows/approve/{id}
PUT    /api/Workflows/reject/{id}
```

#### Line Elements
```http
GET    /api/Lignes/by-document/{documentId}
POST   /api/Lignes
PUT    /api/Lignes/{id}
DELETE /api/Lignes/{id}
```

For complete API documentation, run the backend and visit `/swagger`

## 🧪 Testing

### Backend Tests
```bash
cd DocManagementBackend
dotnet test
```

### Frontend Tests
```bash
cd DocManagementFrontend
npm run test
```

## 📝 Development Workflow

### Adding New Features

1. **Backend**: 
   - Create model in `Models/`
   - Add DbSet to `ApplicationDbContext`
   - Create migration: `dotnet ef migrations add FeatureName`
   - Implement controller in `Controllers/`
   - Add business logic in `Services/`

2. **Frontend**:
   - Create components in `src/components/`
   - Add routes in `src/App.tsx`
   - Implement API calls in `src/services/`
   - Add types in `src/types/`

### Code Style
- **Backend**: Follow C# conventions and use XML documentation
- **Frontend**: Use TypeScript strict mode, ESLint, and Prettier
- **Database**: Use descriptive table and column names

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt with salt for password security
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Input Validation**: Comprehensive input sanitization
- **Role-Based Access**: Granular permission system

## 🌐 Environment Configuration

### Development
```env
# Backend (.env)
JWT_SECRET=dev-secret-key
ISSUER=DMBApp-Dev
AUDIENCE=DMBApp-Users-Dev
ASPNETCORE_ENVIRONMENT=Development

# Frontend (.env.local)
VITE_API_URL=https://localhost:7155/api
VITE_ENVIRONMENT=development
```

### Production
```env
# Backend
JWT_SECRET=production-secret-key-very-long-and-secure
ISSUER=DMBApp-Prod
AUDIENCE=DMBApp-Users-Prod
ASPNETCORE_ENVIRONMENT=Production

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENVIRONMENT=production
```

## 📚 Documentation

- **API Documentation**: Available at `/swagger` when running backend
- **Frontend Storybook**: Run `npm run storybook` in frontend directory
- **Database Schema**: See `Database/schema.sql`
- **Deployment Guide**: See `DEPLOYMENT.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Update documentation
- Follow existing code patterns
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: .NET Core API with Entity Framework
- **Frontend Development**: React with TypeScript and modern UI components
- **Database Design**: SQL Server with optimized queries
- **DevOps**: Docker containerization and CI/CD pipelines

## 🐛 Known Issues

- [ ] Firebase integration needs credentials setup
- [ ] Some API endpoints need rate limiting
- [ ] Mobile responsiveness improvements needed
- [ ] Batch operations can be optimized

## 🔮 Roadmap

- [ ] Real-time notifications with SignalR
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with external document systems
- [ ] Advanced audit logging
- [ ] Performance monitoring and metrics

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check existing documentation
- Review API examples in `DocManagementBackend/API_Examples.md`

---

**Built with ❤️ using .NET 9 and React**
