# Line Elements Management Interface

## Overview

The Line Elements Management interface provides a comprehensive solution for managing the three core element types used in document lines: **Items**, **Unit Codes**, and **General Accounts**. This interface offers full CRUD (Create, Read, Update, Delete) operations with advanced search, filtering, and sorting capabilities.

## Features

### 🎯 Main Features
- **Tabbed Interface**: Organized management of Items, Unit Codes, and General Accounts
- **Real-time Statistics**: Dashboard showing counts for each element type
- **Global Search**: Search across all element types from the main interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Role-based Access**: Restricted to Admin and FullUser roles

### 📊 Dashboard Statistics
- **Items Count**: Total number of physical items and products
- **Unit Codes Count**: Total number of measurement units
- **General Accounts Count**: Total number of accounting codes
- **Real-time Updates**: Counts update automatically when elements are added/removed

## Interface Components

### 1. Items Management

#### Features
- **Create Items**: Add new physical items with code, description, and optional unit
- **Edit Items**: Update item description and unit assignment
- **Delete Items**: Remove items with usage validation
- **Unit Assignment**: Link items to unit codes for measurement
- **Usage Tracking**: View how many document lines reference each item

#### Form Fields
- **Code** (Required): Unique identifier for the item (e.g., ITM001)
- **Description** (Required): Descriptive name of the item
- **Unit Code** (Optional): Associated measurement unit

#### Validation Rules
- Code must be unique across all items
- Description is required and cannot be empty
- Unit code must exist in the UniteCodes table if specified
- Cannot delete items that are referenced in document lines

### 2. Unit Codes Management

#### Features
- **Create Unit Codes**: Add new measurement units
- **Edit Unit Codes**: Update unit descriptions
- **Delete Unit Codes**: Remove units with dependency validation
- **Item Tracking**: View how many items use each unit code

#### Form Fields
- **Code** (Required): Unique unit identifier (e.g., KG, M, L)
- **Description** (Required): Full description of the unit (e.g., Kilogram, Meter, Liter)

#### Validation Rules
- Code must be unique across all unit codes
- Description is required and cannot be empty
- Cannot delete unit codes that are used by items

### 3. General Accounts Management

#### Features
- **Create General Accounts**: Add new accounting codes
- **Edit General Accounts**: Update account descriptions
- **Delete General Accounts**: Remove accounts with usage validation
- **Line Tracking**: View how many document lines reference each account

#### Form Fields
- **Code** (Required): Unique account identifier (e.g., 6061, 7001)
- **Description** (Required): Account description

#### Validation Rules
- Code must be unique across all general accounts
- Description is required and cannot be empty
- Cannot delete accounts that are referenced in document lines

## User Interface

### Navigation
- **Access**: Available in the sidebar navigation as "Line Elements"
- **Icon**: Package icon for easy identification
- **Location**: Under the Document Types section in the navigation menu

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Line Elements Management                                     │
├─────────────────────────────────────────────────────────────┤
│ [Search Box]                                                │
├─────────────────────────────────────────────────────────────┤
│ [Items: 25] [Unit Codes: 8] [General Accounts: 15]        │
├─────────────────────────────────────────────────────────────┤
│ [Items Tab] [Unit Codes Tab] [General Accounts Tab]       │
├─────────────────────────────────────────────────────────────┤
│ Tab Content:                                               │
│ - Search and Filter Controls                               │
│ - Data Table with Actions                                  │
│ - Create/Edit Dialogs                                      │
└─────────────────────────────────────────────────────────────┘
```

### Search and Filtering

#### Global Search
- **Location**: Top of the interface
- **Scope**: Searches across all element types
- **Fields**: Code and description for all elements

#### Tab-specific Search
- **Location**: Within each tab
- **Scope**: Searches within the current element type
- **Real-time**: Updates results as you type

#### Filtering Options
- **Items**: Filter by unit code assignment
- **Unit Codes**: Sort by code, description, or creation date
- **General Accounts**: Sort by code, description, or creation date

### Data Tables

#### Column Structure

**Items Table:**
| Column | Description |
|--------|-------------|
| Code | Item identifier with icon |
| Description | Item name/description |
| Unit | Associated unit code (if any) |
| Lines Count | Number of document lines using this item |
| Created | Creation date |
| Actions | Edit/Delete buttons |

**Unit Codes Table:**
| Column | Description |
|--------|-------------|
| Code | Unit identifier with icon |
| Description | Unit name/description |
| Items Count | Number of items using this unit |
| Created | Creation date |
| Actions | Edit/Delete buttons |

**General Accounts Table:**
| Column | Description |
|--------|-------------|
| Code | Account identifier with icon |
| Description | Account name/description |
| Lines Count | Number of document lines using this account |
| Created | Creation date |
| Actions | Edit/Delete buttons |

### Color Coding
- **Items**: Green theme (🟢)
- **Unit Codes**: Yellow theme (🟡)
- **General Accounts**: Purple theme (🟣)

## Technical Implementation

### Frontend Components

#### Main Components
- `LineElementsManagement.tsx`: Main page component
- `ItemsManagement.tsx`: Items management tab
- `UniteCodesManagement.tsx`: Unit codes management tab
- `GeneralAccountsManagement.tsx`: General accounts management tab

#### Key Features
- **React Hooks**: useState, useEffect, useMemo for state management
- **Real-time Search**: Debounced search with instant filtering
- **Form Validation**: Client-side validation with error messages
- **Responsive Design**: Mobile-first approach with breakpoints
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Toast notifications for user feedback

### Backend Integration

#### API Endpoints
- `GET /api/Items`: Fetch all items
- `POST /api/Items`: Create new item
- `PUT /api/Items/{code}`: Update item
- `DELETE /api/Items/{code}`: Delete item
- Similar endpoints for UniteCodes and GeneralAccounts

#### Data Validation
- Server-side validation for all operations
- Referential integrity checks
- Unique constraint validation
- Usage validation before deletion

## Usage Scenarios

### 1. Setting Up Items
1. Navigate to Line Elements Management
2. Go to Items tab
3. Click "Add Item"
4. Enter item code and description
5. Optionally select a unit code
6. Save the item

### 2. Managing Unit Codes
1. Go to Unit Codes tab
2. Create unit codes first (e.g., KG, L, M)
3. Items can then reference these units
4. View which items use each unit

### 3. Configuring General Accounts
1. Go to General Accounts tab
2. Add accounting codes (e.g., 6061, 7001)
3. These will be available when creating document lines
4. Track usage across document lines

### 4. Maintenance Operations
1. **Search**: Use global or tab-specific search
2. **Edit**: Click edit button to modify descriptions
3. **Delete**: Remove unused elements (with validation)
4. **Monitor Usage**: Check reference counts before deletion

## Security and Permissions

### Access Control
- **Required Roles**: Admin or FullUser
- **Restricted Operations**: SimpleUser cannot access this interface
- **Management Flag**: Requires `requiresManagement` permission

### Data Protection
- **Validation**: All inputs validated on client and server
- **Sanitization**: User inputs sanitized to prevent XSS
- **Authorization**: JWT token validation for all API calls

## Best Practices

### Data Management
1. **Consistent Naming**: Use clear, descriptive codes and names
2. **Unit Assignment**: Assign appropriate units to items when applicable
3. **Regular Cleanup**: Periodically review and remove unused elements
4. **Documentation**: Maintain clear descriptions for all elements

### User Experience
1. **Search First**: Use search to find existing elements before creating new ones
2. **Check Dependencies**: Review usage counts before deleting elements
3. **Batch Operations**: Plan bulk changes during low-usage periods
4. **Validation**: Pay attention to validation messages and requirements

## Future Enhancements

### Planned Features
- **Bulk Import/Export**: CSV import/export functionality
- **Advanced Filtering**: More granular filtering options
- **Audit Trail**: Track changes and modifications
- **Categories**: Organize items and accounts into categories
- **Templates**: Pre-defined element templates for common use cases

### Integration Opportunities
- **External Systems**: Integration with ERP systems
- **Barcode Support**: Barcode scanning for item management
- **Approval Workflow**: Approval process for element changes
- **Reporting**: Advanced reporting and analytics

## Troubleshooting

### Common Issues

#### Cannot Delete Element
- **Cause**: Element is referenced in document lines
- **Solution**: Remove references first or use cascade deletion (if implemented)

#### Duplicate Code Error
- **Cause**: Attempting to create element with existing code
- **Solution**: Use unique codes or update existing element

#### Search Not Working
- **Cause**: Network connectivity or server issues
- **Solution**: Refresh page or check server status

#### Permission Denied
- **Cause**: Insufficient user permissions
- **Solution**: Contact administrator for role assignment

### Support
For technical support or feature requests, contact the development team or submit an issue through the project management system.

---

*This interface is part of the Document Management System and integrates seamlessly with the document line creation and editing workflows.* 