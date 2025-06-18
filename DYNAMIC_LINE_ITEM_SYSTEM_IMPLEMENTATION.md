# Dynamic Line-Item System Implementation

## 📋 Overview

This document outlines the implementation of a dynamic line-item system that allows for flexible element types (Item, GeneralAccount) while ensuring referential integrity and extensibility for future element types.

## 🔧 Database Schema Changes

### Modified Tables

#### 1. LignesElementType
- **Purpose**: Define the type of line element (e.g., Item, General Account)
- **Key Changes**:
  - `TypeElement` → Changed from string to ENUM: `ElementType.Item` | `ElementType.GeneralAccounts`
  - Added backward compatibility with `TypeElementString` helper property
  - Maintained conditional foreign keys during transition period

#### 2. Ligne (Line)
- **New Fields**:
  - `Type` → Foreign key to `LignesElementType(Id)`
  - `ElementId` → Dynamic foreign key reference (string, 50 chars)
  - Maintained `LignesElementTypeId` for backward compatibility

#### 3. GeneralAccounts
- **New Fields**:
  - `Type` → ENUM: `GeneralAccountType` (Revenue, Expense, Asset, Liability, Equity)

#### 4. Item, UniteCode
- **No breaking changes**: Maintained existing structure with backward compatibility navigation properties

## 🏗️ Model Architecture

### Dynamic Reference System

```csharp
public class Ligne
{
    // Dynamic foreign key system
    public int? Type { get; set; } // → LignesElementType(Id)
    public string? ElementId { get; set; } // → Dynamic reference to Item.Code or GeneralAccounts.Code
    
    // Method to load appropriate element
    public async Task LoadElementAsync(ApplicationDbContext context)
    {
        switch (LignesElementType.TypeElement)
        {
            case ElementType.Item:
                Item = await context.Items.FirstOrDefaultAsync(i => i.Code == ElementId);
                break;
            case ElementType.GeneralAccounts:
                GeneralAccount = await context.GeneralAccounts.FirstOrDefaultAsync(ga => ga.Code == ElementId);
                break;
        }
    }
}
```

### Enum Definitions

```csharp
public enum ElementType
{
    Item,
    GeneralAccounts
}

public enum GeneralAccountType
{
    Revenue,
    Expense,
    Asset,
    Liability,
    Equity
}
```

## 🔄 Backward Compatibility Strategy

### 1. Field Synchronization
- `LignesElementTypeId` ↔ `Type` synchronization during transition
- `TypeElementString` helper property for enum ↔ string conversion

### 2. Navigation Properties
- Maintained existing navigation properties on all models
- Added new computed properties for dynamic access

### 3. API Compatibility
- DTOs continue to use string values for `TypeElement`
- Controllers handle enum ↔ string conversion automatically

## 🚀 Extension for Future Element Types

### Adding New Element Types (e.g., Service, Contract)

1. **Update Enum**:
```csharp
public enum ElementType
{
    Item,
    GeneralAccounts,
    Service,      // New
    Contract      // New
}
```

2. **Create New Models**:
```csharp
public class Service
{
    [Key]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    // Service-specific properties...
}
```

3. **Update LoadElementAsync**:
```csharp
switch (LignesElementType.TypeElement)
{
    case ElementType.Service:
        Service = await context.Services.FirstOrDefaultAsync(s => s.Code == ElementId);
        break;
    // ... existing cases
}
```

## 📊 Data Migration

### Migration: `RefactorToDynamicLineElementSystem`
- Added `ElementId` column to `Lignes` table
- Added `Type` column to `Lignes` table
- Added `Type` column to `GeneralAccounts` table
- Modified `TypeElement` column to support enum storage

### Data Seeding
- UniteCodes: Standard measurement units (PCS, KG, M, M2, etc.)
- GeneralAccounts: Sample chart of accounts with proper types

## 🔍 Validation & Integrity

### 1. Application-Level Validation
- `ElementId` validation ensures references exist in appropriate tables
- Type-specific validation in `Ligne.IsValid()` method
- Business rule validation in services

### 2. Database Constraints
- Unique constraints on codes in all reference tables
- Foreign key constraints for primary relationships
- Enum storage with string conversion for flexibility

## 🛠️ API Endpoints

### LignesElementType Management
- `GET /api/LignesElementType` - Get all element types
- `GET /api/LignesElementType/simple` - Get simplified list
- `GET /api/LignesElementType/by-type/{typeElement}` - Filter by type
- `POST /api/LignesElementType/for-item/{itemCode}` - Create for item
- `POST /api/LignesElementType/for-account/{accountCode}` - Create for account

### Dynamic Line Management
- Standard CRUD operations with automatic element loading
- Type-aware validation and count management
- Backward compatibility with existing APIs

## 🧪 Testing Strategy

### Unit Tests Required
1. **Model Validation Tests**
   - Enum conversion validation
   - Dynamic loading validation
   - Business rule validation

2. **Service Layer Tests**
   - Element type creation and management
   - Dynamic reference resolution
   - Data integrity validation

3. **API Integration Tests**
   - Backward compatibility verification
   - New functionality validation
   - Error handling scenarios

## 📈 Performance Considerations

### Optimizations Implemented
1. **Lazy Loading**: Elements loaded only when needed via `LoadElementAsync()`
2. **Caching**: Consider implementing cache for frequently accessed element types
3. **Indexing**: Proper indexes on `Code` fields for fast lookups
4. **Computed Properties**: Avoid N+1 queries with proper includes

### Future Optimizations
1. **Materialized Views**: For complex reporting scenarios
2. **Read Replicas**: For high-volume read operations
3. **Event Sourcing**: For audit trail and history tracking

## ✅ Migration Checklist

- [x] Define enum types (`ElementType`, `GeneralAccountType`)
- [x] Update model classes with new fields
- [x] Implement backward compatibility helpers
- [x] Update DbContext configuration
- [x] Fix compilation errors in controllers and services
- [x] Create and run database migration
- [x] Update data seeding
- [x] Test basic functionality
- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Update frontend TypeScript interfaces
- [ ] Update API documentation
- [ ] Performance testing
- [ ] Production deployment

## 🔧 Troubleshooting

### Common Issues

1. **Enum Conversion Errors**
   - Use `TypeElementString` property for backward compatibility
   - Ensure DTOs use `ToString()` for enum serialization

2. **Foreign Key Constraint Violations**
   - Validate `ElementId` references before saving
   - Use `LoadElementAsync()` to verify relationships

3. **Migration Conflicts**
   - Review existing migrations for conflicts
   - Test migration on development database first

### Debug Tips
- Use Entity Framework logging for query debugging
- Validate enum values during API requests
- Check for null reference exceptions in dynamic loading

---

**Implementation completed**: Dynamic line-item system with backward compatibility
**Migration ready**: Database schema updated for new system
**API compatible**: Existing endpoints maintain functionality
**Extensible**: Easy addition of new element types in the future 