# DocuVerse - Document Management Frontend

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.4-green.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-blue.svg)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-black.svg)](https://ui.shadcn.com/)

A modern, responsive frontend application for the DocuVerse document management system, built with React 18, TypeScript, and a comprehensive UI component library.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Components](#components)
- [Pages & Features](#pages--features)
- [API Integration](#api-integration)
- [Styling & Theming](#styling--theming)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

DocuVerse Frontend is a sophisticated single-page application (SPA) that provides a complete user interface for document management workflows. The application features a modern design system, comprehensive document lifecycle management, and seamless integration with the DocuVerse backend API.

### Key Capabilities

- **Modern React Architecture**: Built with React 18, TypeScript, and modern hooks
- **Comprehensive UI**: 60+ reusable components with consistent design
- **Document Management**: Complete document workflow interface
- **User Experience**: Responsive design with accessibility features
- **Real-time Updates**: Live data synchronization with backend
- **Multi-tenant Support**: Role-based access and responsibility centers

## ✨ Features

### Core Document Management
- ✅ Document creation, editing, and viewing
- ✅ Document type and subtype management
- ✅ File upload and attachment handling
- ✅ Advanced search and filtering
- ✅ Bulk operations and batch processing
- ✅ Document version control
- ✅ Print and export functionality

### Workflow & Approval System
- ✅ Circuit-based approval workflows
- ✅ Visual workflow designer
- ✅ Step-by-step approval process
- ✅ Approval delegation and routing
- ✅ Real-time approval notifications
- ✅ Workflow history and audit trails
- ✅ Custom approval rules

### User Interface
- ✅ Modern, responsive design
- ✅ Dark/light theme support
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Mobile-first responsive layout
- ✅ Advanced data tables with sorting/filtering
- ✅ Interactive charts and dashboards
- ✅ Real-time notifications

### Administration
- ✅ User management and roles
- ✅ Responsibility center administration
- ✅ System configuration
- ✅ Analytics and reporting
- ✅ Reference data management
- ✅ ERP integration monitoring

### Developer Experience
- ✅ TypeScript for type safety
- ✅ Component documentation
- ✅ Hot module replacement
- ✅ ESLint and code formatting
- ✅ Modular architecture
- ✅ Custom hooks and utilities

## 🛠 Technology Stack

### Core Framework
- **React 18.3.1**: Modern React with concurrent features
- **TypeScript 5.5.3**: Static type checking
- **Vite 6.2.4**: Fast build tool and dev server
- **React Router 6.26.2**: Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Radix UI**: Unstyled, accessible components
- **Framer Motion 12.11.0**: Animations and gestures
- **Lucide React**: Beautiful icons

### State Management & Data
- **TanStack Query 5.56.2**: Server state management
- **React Hook Form 7.53.0**: Form handling
- **Zod 3.23.8**: Schema validation
- **Axios 1.8.4**: HTTP client

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Lovable Tagger**: Component tagging
- **TypeScript Config**: Strict type checking

### Key Dependencies
```json
{
  "@hookform/resolvers": "^3.9.0",
  "@tanstack/react-query": "^5.56.2",
  "axios": "^1.8.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "cmdk": "^1.1.1",
  "date-fns": "^3.6.0",
  "embla-carousel-react": "^8.3.0",
  "framer-motion": "^12.11.0",
  "lucide-react": "^0.462.0",
  "next-themes": "^0.3.0",
  "react-router-dom": "^6.26.2",
  "recharts": "^2.12.7",
  "sonner": "^1.5.0",
  "tailwind-merge": "^2.5.2",
  "zod": "^3.23.8"
}
```

## 🏗 Architecture

### Application Structure
```
Frontend Architecture
┌─────────────────────────────┐
│      Presentation Layer     │  Pages, Components, UI
├─────────────────────────────┤
│     Application Layer       │  Hooks, Context, Routing
├─────────────────────────────┤
│      Service Layer          │  API Services, Utilities
├─────────────────────────────┤
│       Data Layer           │  State Management, Cache
└─────────────────────────────┘
```

### Core Patterns

#### Component Architecture
- **Atomic Design**: Components organized by complexity
- **Compound Components**: Complex UI patterns
- **Render Props**: Flexible component composition
- **Custom Hooks**: Reusable business logic

#### State Management
- **Server State**: TanStack Query for API data
- **Client State**: React Context for app state
- **Form State**: React Hook Form for forms
- **URL State**: React Router for navigation state

#### Data Flow
- **Unidirectional**: Props down, events up
- **Context Providers**: Global state management
- **Custom Hooks**: Encapsulated logic
- **Service Layer**: API abstraction

## ⚙️ Installation

### Prerequisites

- **Node.js**: Version 18.0.0 or later
- **npm**: Version 9.0.0 or later (or Bun 1.0.0+)
- **Git**: For version control

### Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd DocManagementFrontend

# Install dependencies (using npm)
npm install

# Or using Bun (faster)
bun install

# Start development server
npm run dev
# or
bun run dev

# Open browser to http://localhost:3000
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_STORAGE_KEY=docuverse_token
VITE_REFRESH_TOKEN_KEY=docuverse_refresh

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# Theme
VITE_DEFAULT_THEME=light
VITE_ENABLE_THEME_SWITCHER=true
```

## 💻 Development

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Development Server Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 3000,
    hmr: { overlay: false }
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
```

### Code Style & Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noImplicitAny": false,
    "skipLibCheck": true,
    "strictNullChecks": false
  }
}
```

#### ESLint Rules
- React Hooks rules enforced
- TypeScript strict mode
- Import order organization
- Consistent code formatting

#### Naming Conventions
- **Components**: PascalCase (`DocumentCard.tsx`)
- **Files**: kebab-case for utils, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase with descriptive names

## 📁 Project Structure

```
DocManagementFrontend/
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # shadcn/ui components (60+ files)
│   │   ├── admin/             # Admin-specific components
│   │   ├── document/          # Document-related components
│   │   ├── workflow/          # Workflow components
│   │   ├── navigation/        # Navigation components
│   │   ├── forms/             # Form components
│   │   └── layout/            # Layout components
│   ├── pages/                 # Application pages (45+ files)
│   │   ├── documents/         # Document management pages
│   │   ├── register/          # Registration flow
│   │   ├── step-statuses/     # Workflow status pages
│   │   └── *.tsx              # Individual pages
│   ├── services/              # API services (25+ files)
│   │   ├── api/               # Core API utilities
│   │   ├── documents/         # Document services
│   │   ├── document-types/    # Document type services
│   │   └── *.ts               # Individual services
│   ├── hooks/                 # Custom React hooks (25+ files)
│   │   ├── document-types/    # Document type hooks
│   │   ├── document-workflow/ # Workflow hooks
│   │   └── *.ts               # Individual hooks
│   ├── context/               # React context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   ├── ThemeContext.tsx   # Theme management
│   │   ├── SettingsContext.tsx # App settings
│   │   └── form/              # Form contexts
│   ├── models/                # TypeScript type definitions
│   │   ├── auth.ts            # Authentication types
│   │   ├── document.ts        # Document types
│   │   ├── workflow.ts        # Workflow types
│   │   └── *.ts               # Other model types
│   ├── lib/                   # Utilities and configuration
│   │   ├── utils.ts           # Common utilities
│   │   └── themes.ts          # Theme configuration
│   ├── styles/                # Global styles
│   │   ├── document-flow.css  # Document flow styles
│   │   ├── form-overrides.css # Form customizations
│   │   └── responsive.css     # Responsive utilities
│   ├── utils/                 # Utility functions
│   │   ├── errorHandling.ts   # Error handling utilities
│   │   ├── erpErrorHandling.ts # ERP-specific errors
│   │   └── formatDateForAPI.ts # Date utilities
│   ├── translations/          # Internationalization
│   │   └── index.ts           # Translation keys
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global CSS and Tailwind
├── docs/                     # Documentation
│   └── ERP_ERROR_HANDLING.md # ERP integration docs
├── supabase/                 # Supabase configuration
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🧩 Components

### UI Component Library

The application uses **shadcn/ui** as the foundation with 60+ components:

#### Core Components
- **Accordion**: Collapsible content sections
- **Alert Dialog**: Modal confirmations
- **Avatar**: User profile images
- **Badge**: Status indicators
- **Button**: Interactive buttons with variants
- **Card**: Content containers
- **Checkbox**: Form inputs
- **Dialog**: Modal windows
- **Dropdown Menu**: Context menus
- **Form**: Form wrapper with validation
- **Input**: Text inputs with validation
- **Select**: Dropdown selections
- **Table**: Data tables with sorting
- **Toast**: Notification system

#### Advanced Components
- **Command**: Command palette interface
- **Data Table**: Enhanced tables with filtering
- **Date Picker**: Calendar date selection
- **Multi-Select**: Multiple option selection
- **Resizable Panels**: Adjustable layouts
- **Sidebar**: Navigation sidebar
- **Tabs**: Tabbed interfaces
- **Tooltip**: Contextual help

### Custom Components

#### Document Management
- **DocumentCard**: Document preview cards
- **DocumentFlow**: Workflow visualization
- **CreateDocumentWizard**: Multi-step document creation
- **DocumentTable**: Advanced document listing
- **LineEditor**: Document line editing

#### Workflow Components
- **CircuitFlow**: Visual workflow designer
- **ApprovalCard**: Approval status display
- **StepForm**: Workflow step configuration
- **TransitionDialog**: Step transition management

#### Admin Components
- **UserManagement**: User administration
- **RoleAssignment**: Permission management
- **SystemSettings**: Configuration panels

## 📄 Pages & Features

### Authentication Pages
- **Login** (`Login.tsx`): JWT-based authentication
- **Register** (`Register.tsx`): Multi-step registration
- **ForgotPassword** (`ForgotPassword.tsx`): Password recovery
- **EmailVerification** (`EmailVerification.tsx`): Email confirmation

### Document Management
- **Documents** (`Documents.tsx`): Document listing and management
- **CreateDocument** (`CreateDocument.tsx`): Document creation wizard
- **ViewDocument** (`ViewDocument.tsx`): Document details view
- **EditDocument** (`EditDocument.tsx`): Document editing interface
- **DocumentFlow** (`DocumentFlowPage.tsx`): Workflow visualization

### Administration
- **Admin** (`Admin.tsx`): Admin dashboard
- **UserManagement** (`UserManagement.tsx`): User administration
- **DocumentTypes** (`DocumentTypes.tsx`): Document type management
- **Circuits** (`Circuits.tsx`): Workflow circuit management
- **Settings** (`Settings.tsx`): System configuration

### Workflow Management
- **PendingApprovals** (`PendingApprovalsPage.tsx`): Approval queue
- **CircuitSteps** (`CircuitStepsPage.tsx`): Step configuration
- **StepStatuses** (`StepStatusesPage.tsx`): Status management

### Reference Data
- **ResponsibilityCentre** (`ResponsibilityCentreManagement.tsx`): Center management
- **CustomerManagement** (`CustomerManagement.tsx`): Customer data
- **VendorManagement** (`VendorManagement.tsx`): Vendor information
- **LineElements** (`LineElementsManagement.tsx`): Element configuration

## 🔌 API Integration

### Service Architecture

The application uses a service-oriented architecture for API integration:

#### Core Services
```typescript
// Authentication Service
authService.login(credentials)
authService.register(userData)
authService.refreshToken()

// Document Service
documentService.getDocuments(filters)
documentService.createDocument(data)
documentService.updateDocument(id, data)

// Workflow Service
workflowService.getCircuits()
workflowService.processStep(stepId, action)
workflowService.getApprovals()
```

#### API Client Configuration
```typescript
// axiosInstance.ts
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling

Comprehensive error handling with user-friendly messages:

```typescript
// utils/erpErrorHandling.ts
export const showErpError = (error: ErpError, operation: string) => {
  const errorInfo = extractErpError(error, operation);
  
  toast.error(errorInfo.title, {
    description: errorInfo.message,
    action: errorInfo.action
  });
};
```

#### Error Types
- **Network Errors**: Connection issues
- **Authentication Errors**: Token problems
- **Validation Errors**: Data validation failures
- **ERP Integration Errors**: Business Central issues
- **Permission Errors**: Access denied scenarios

### React Query Integration

```typescript
// hooks/useDocuments.ts
export const useDocuments = (filters: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentService.getDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

// hooks/useCreateDocument.ts
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: documentService.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document created successfully');
    },
    onError: (error) => {
      showErpError(error, 'create document');
    }
  });
};
```

## 🎨 Styling & Theming

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // DocuVerse custom colors
        docuBlue: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          // ... full color palette
        },
        // CSS variables for theme switching
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... component colors
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite'
      }
    }
  }
};
```

### Theme System

#### Theme Provider
```typescript
// context/ThemeContext.tsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### CSS Variables
```css
/* src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... */
}
```

### Component Styling

#### Class Variance Authority
```typescript
// Button component variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        // ... more variants
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      }
    }
  }
);
```

### Responsive Design

```css
/* styles/responsive.css */
@media (max-width: 768px) {
  .document-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    transform: translateX(-100%);
  }
}

@media (max-width: 640px) {
  .table-responsive {
    display: block;
    overflow-x: auto;
  }
}
```

## 🔐 Authentication

### JWT-Based Authentication

#### Auth Context
```typescript
// context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auto-login on app start
  useEffect(() => {
    const token = tokenManager.getToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      validateAndSetUser(token);
    }
    setLoading(false);
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Protected Routes
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiresManagement?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiresManagement 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && !hasRequiredRole(user, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

#### Token Management
```typescript
// services/tokenManager.ts
export const tokenManager = {
  getToken: () => localStorage.getItem('docuverse_token'),
  
  setToken: (token: string) => {
    localStorage.setItem('docuverse_token', token);
  },
  
  removeToken: () => {
    localStorage.removeItem('docuverse_token');
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};
```

### Role-Based Access Control

#### User Roles
- **Admin**: Full system access
- **FullUser**: Document management and workflows
- **ReadOnlyUser**: Read-only access
- **Manager**: Management functions
- **Approver**: Approval permissions

#### Permission Checking
```typescript
// hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();
  
  const canManageDocuments = useMemo(() => {
    return user?.roles.includes('Admin') || 
           user?.roles.includes('FullUser');
  }, [user]);
  
  const canApprove = useMemo(() => {
    return user?.roles.includes('Admin') || 
           user?.roles.includes('Approver');
  }, [user]);
  
  return { canManageDocuments, canApprove };
};
```

## 🧪 Testing

### Testing Strategy

#### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

#### Component Testing
```typescript
// tests/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

#### Integration Testing
```typescript
// tests/pages/Login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import Login from '@/pages/Login';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Login Page', () => {
  it('submits login form successfully', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      });
    });
  });
});
```

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Build output directory
ls -la dist/
# ├── assets/           # Bundled JS/CSS
# ├── index.html        # Entry point
# └── favicon.ico       # Static assets
```

### Environment Configuration

#### Production Environment Variables
```env
# .env.production
VITE_API_BASE_URL=https://api.docuverse.com/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Deployment Options

#### Static Hosting (Netlify/Vercel)
```json
// netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev @bundle-analyzer/webpack-analyzer
npm run build -- --analyze
```

#### Vite Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['axios', 'date-fns', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### Performance Features
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: WebP support with fallbacks
- **Caching**: Browser caching strategies
- **Tree Shaking**: Unused code elimination

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-component`
3. **Make changes**: Follow coding standards
4. **Add tests**: Ensure component testing
5. **Update documentation**: Component docs
6. **Commit changes**: Use conventional commits
7. **Push branch**: `git push origin feature/new-component`
8. **Create Pull Request**: Detailed description

### Coding Standards

#### Component Development
```typescript
// Good component structure
interface ComponentProps {
  /** Component description */
  variant?: 'default' | 'secondary';
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children: React.ReactNode;
}

export const Component = ({ 
  variant = 'default', 
  className, 
  children 
}: ComponentProps) => {
  return (
    <div className={cn(componentVariants({ variant }), className)}>
      {children}
    </div>
  );
};
```

#### Custom Hooks
```typescript
// hooks/useDocumentActions.ts
export const useDocumentActions = (documentId: string) => {
  const queryClient = useQueryClient();
  
  const deleteDocument = useMutation({
    mutationFn: () => documentService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document deleted successfully');
    }
  });
  
  return { deleteDocument };
};
```

### Code Review Checklist

- [ ] TypeScript types properly defined
- [ ] Components follow naming conventions
- [ ] Accessibility attributes included
- [ ] Error handling implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance considerations addressed
- [ ] Mobile responsiveness verified

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### 2. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update type definitions
npm update @types/react @types/react-dom
```

#### 3. API Connection Issues
```typescript
// Check API configuration
console.log('API Base URL:', process.env.VITE_API_BASE_URL);

// Test API connectivity
curl -X GET "http://localhost:5000/api/health"
```

#### 4. Authentication Problems
- Check JWT token in localStorage
- Verify token expiration
- Confirm API authentication headers
- Check CORS configuration

#### 5. Styling Issues
```bash
# Rebuild Tailwind classes
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# Check for conflicting CSS
npm run build -- --debug
```

### Development Tools

#### Browser DevTools
- **React Developer Tools**: Component inspection
- **Network Tab**: API request monitoring
- **Console**: Error tracking and debugging
- **Application Tab**: localStorage/sessionStorage inspection

#### VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Prettier - Code formatter**

### Performance Monitoring

```typescript
// utils/performance.ts
export const measurePerformance = (name: string) => {
  return {
    start: () => performance.mark(`${name}-start`),
    end: () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
    }
  };
};
```

### Support Resources

- **Component Documentation**: Storybook at `/storybook`
- **API Documentation**: Backend Swagger UI
- **Design System**: Figma design files
- **Issue Tracking**: GitHub Issues
- **Team Communication**: Slack/Discord channels

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support and questions:
- **Email**: frontend-support@docuverse.com
- **Documentation**: [Component Docs](./docs/)
- **GitHub Issues**: [Create an issue](https://github.com/your-org/docuverse/issues)
- **Community**: [Discussions](https://github.com/your-org/docuverse/discussions)

---

**DocuVerse Frontend** - Modern React Interface for Advanced Document Management
