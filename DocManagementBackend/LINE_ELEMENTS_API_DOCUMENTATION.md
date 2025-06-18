# Line Elements Data Model & API Documentation

## Overview

This document describes the expanded data model for line item elements and the new calculation logic for pricing, discounts, VAT, and totals. The system now supports typed element linking through reference tables.

## 🧱 New Data Model

### 1. LignesElementType Table
Defines the type of line element (e.g., Item, Unit Code, General Account).

**Fields:**
- `Id` (Primary Key, int)
- `TypeElement` (string, 50 chars) → ENUM: 'Item' | 'Unite code' | 'General Accounts'
- `Description` (string, 200 chars) → Label/description
- `TableName` (string, 100 chars) → E.g. 'Item', 'UniteCode', 'GeneralAccounts'
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

**Constraints:**
- Unique constraint on `TypeElement`

### 2. Item Table
Product or service items reference table.

**Fields:**
- `Code` (Primary Key, string, 50 chars)
- `Description` (string, 500 chars)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

**Constraints:**
- Unique constraint on `Code`

### 3. UniteCode Table
Unit of measurement codes reference table.

**Fields:**
- `Code` (Primary Key, string, 50 chars)
- `Description` (string, 500 chars)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

**Constraints:**
- Unique constraint on `Code`

### 4. GeneralAccounts Table
General accounting codes reference table.

**Fields:**
- `Code` (Primary Key, string, 50 chars)
- `Description` (string, 500 chars)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

**Constraints:**
- Unique constraint on `Code`

### 5. Enhanced Ligne Table
The existing Line table has been expanded with new fields for typed element linking and calculation logic.

**New Fields Added:**
- `TypeId` (Foreign Key → LignesElementType.Id, nullable)
- `ItemCode` (Foreign Key → Item.Code, nullable, 50 chars)
- `UniteCodeCode` (Foreign Key → UniteCode.Code, nullable, 50 chars)
- `GeneralAccountsCode` (Foreign Key → GeneralAccounts.Code, nullable, 50 chars)
- `Quantity` (decimal(18,4), default: 1)
- `PriceHT` (decimal(18,4), default: 0) → Unit price excluding tax
- `DiscountPercentage` (decimal(5,4), default: 0) → e.g., 0.15 for 15%
- `DiscountAmount` (decimal(18,4), nullable) → Optional; if null, calculate from percentage
- `VatPercentage` (decimal(5,4), default: 0) → e.g., 0.2 for 20%

**Calculated Properties (Not Mapped to DB):**
- `AmountHT` (decimal) → Amount excluding tax
- `AmountVAT` (decimal) → VAT amount
- `AmountTTC` (decimal) → Total amount including tax

**Legacy Field:**
- `Prix` (float) → Marked as obsolete, use `PriceHT` instead

## 🧮 Calculation Logic

### Amount HT (Excluding Tax)
```csharp
if (DiscountAmount.HasValue)
{
    AmountHT = PriceHT * Quantity - DiscountAmount.Value;
}
else
{
    AmountHT = PriceHT * Quantity * (1 - DiscountPercentage);
}
```

### Amount VAT
```csharp
AmountVAT = AmountHT * VatPercentage;
```

### Amount TTC (Including Tax)
```csharp
AmountTTC = AmountHT + AmountVAT;
```

## 🔗 Relationships

- **Ligne → LignesElementType**: Many-to-One (optional)
- **Ligne → Item**: Many-to-One (optional)
- **Ligne → UniteCode**: Many-to-One (optional)
- **Ligne → GeneralAccounts**: Many-to-One (optional)

All foreign key relationships use `DeleteBehavior.Restrict` to prevent accidental data loss.

## 📡 API Endpoints

### LignesElementType Controller

#### GET /api/LignesElementType
Get all element types with full details.

**Response:**
```json
[
  {
    "id": 1,
    "typeElement": "Item",
    "description": "Product or service items",
    "tableName": "Item",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/LignesElementType/simple
Get simplified element types for dropdowns (no authentication required).

**Response:**
```json
[
  {
    "id": 1,
    "typeElement": "Item",
    "description": "Product or service items"
  }
]
```

#### GET /api/LignesElementType/{id}
Get specific element type by ID.

#### POST /api/LignesElementType
Create new element type (Admin only).

**Request:**
```json
{
  "typeElement": "Custom Type",
  "description": "Custom element type description",
  "tableName": "CustomTable"
}
```

#### PUT /api/LignesElementType/{id}
Update element type (Admin only).

#### DELETE /api/LignesElementType/{id}
Delete element type (Admin only). Fails if there are associated lines.

### Item Controller

#### GET /api/Item
Get all items with usage count.

**Response:**
```json
[
  {
    "code": "ITEM001",
    "description": "Sample Item",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "lignesCount": 5
  }
]
```

#### GET /api/Item/simple
Get simplified items for dropdowns (no authentication required).

#### GET /api/Item/{code}
Get specific item by code.

#### POST /api/Item/validate-code
Validate if item code is available.

**Request:**
```json
{
  "code": "ITEM001"
}
```

**Response:**
```json
true  // true if available, false if exists
```

#### POST /api/Item
Create new item (Admin only).

**Request:**
```json
{
  "code": "ITEM001",
  "description": "Sample Item Description"
}
```

#### PUT /api/Item/{code}
Update item description (Admin only).

#### DELETE /api/Item/{code}
Delete item (Admin only). Fails if there are associated lines.

### UniteCode Controller

Similar endpoints to Item controller but for unit codes:
- GET /api/UniteCode
- GET /api/UniteCode/simple
- GET /api/UniteCode/{code}
- POST /api/UniteCode
- PUT /api/UniteCode/{code}
- DELETE /api/UniteCode/{code}

### GeneralAccounts Controller

Similar endpoints to Item controller but for general accounts:
- GET /api/GeneralAccounts
- GET /api/GeneralAccounts/simple
- GET /api/GeneralAccounts/{code}
- POST /api/GeneralAccounts
- PUT /api/GeneralAccounts/{code}
- DELETE /api/GeneralAccounts/{code}

## 🔧 Enhanced Ligne DTOs

### LigneDto (Updated)
```json
{
  "id": 1,
  "documentId": 123,
  "ligneKey": "LINE001",
  "title": "Sample Line",
  "article": "Article description",
  "prix": 100.0,  // Legacy field
  "sousLignesCount": 2,
  
  // Type information
  "typeId": 1,
  "type": {
    "id": 1,
    "typeElement": "Item",
    "description": "Product or service items"
  },
  
  // Element references
  "itemCode": "ITEM001",
  "item": {
    "code": "ITEM001",
    "description": "Sample Item"
  },
  "uniteCodeCode": "KG",
  "uniteCode": {
    "code": "KG",
    "description": "Kilogram"
  },
  "generalAccountsCode": "6001",
  "generalAccounts": {
    "code": "6001",
    "description": "Purchases"
  },
  
  // Pricing fields
  "quantity": 2.5,
  "priceHT": 100.0,
  "discountPercentage": 0.1,  // 10%
  "discountAmount": null,
  "vatPercentage": 0.2,  // 20%
  
  // Calculated fields
  "amountHT": 225.0,   // (100 * 2.5) * (1 - 0.1)
  "amountVAT": 45.0,   // 225 * 0.2
  "amountTTC": 270.0,  // 225 + 45
  
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### CreateLigneRequest
```json
{
  "documentId": 123,
  "ligneKey": "LINE001",
  "title": "Sample Line",
  "article": "Article description",
  
  // Type and element references
  "typeId": 1,
  "itemCode": "ITEM001",
  "uniteCodeCode": "KG",
  "generalAccountsCode": "6001",
  
  // Pricing fields
  "quantity": 2.5,
  "priceHT": 100.0,
  "discountPercentage": 0.1,
  "discountAmount": null,
  "vatPercentage": 0.2
}
```

### UpdateLigneRequest
All fields are optional for partial updates:
```json
{
  "title": "Updated Line Title",
  "quantity": 3.0,
  "priceHT": 120.0,
  "discountPercentage": 0.15
}
```

## 🌱 Seed Data

The system includes seed data for LignesElementType:

1. **Item** (ID: 1)
   - Description: "Product or service items"
   - TableName: "Item"

2. **Unite code** (ID: 2)
   - Description: "Unit of measurement codes"
   - TableName: "UniteCode"

3. **General Accounts** (ID: 3)
   - Description: "General accounting codes"
   - TableName: "GeneralAccounts"

## 🔒 Security

- **Authentication**: All endpoints require authentication except `/simple` endpoints
- **Authorization**: Create, Update, Delete operations require Admin role
- **Validation**: Comprehensive input validation and business rule enforcement
- **Data Integrity**: Foreign key constraints prevent orphaned records

## 🚀 Usage Examples

### Creating a Line with Item Reference
```json
POST /api/Ligne
{
  "documentId": 123,
  "ligneKey": "LINE001",
  "title": "Office Supplies",
  "typeId": 1,  // Item type
  "itemCode": "OFFICE001",
  "uniteCodeCode": "PCS",
  "quantity": 10,
  "priceHT": 25.0,
  "discountPercentage": 0.05,  // 5% discount
  "vatPercentage": 0.2  // 20% VAT
}
```

### Calculation Result
- AmountHT: 25.0 × 10 × (1 - 0.05) = 237.50
- AmountVAT: 237.50 × 0.2 = 47.50
- AmountTTC: 237.50 + 47.50 = 285.00

## 📝 Migration Notes

- Two migrations were created:
  1. `AddLineElementsAndCalculationFields` - Adds new tables and fields
  2. `SeedLignesElementTypes` - Adds seed data
- Legacy `Prix` field is preserved for backward compatibility but marked as obsolete
- All calculated fields are computed properties (not stored in database)
- Existing data remains intact during migration 