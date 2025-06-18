# Multilanguage Implementation Guide

This guide explains how to implement comprehensive multilanguage support throughout the DocuVerse application.

## Overview

The application now supports three languages:

- **English (en)** - Default language
- **French (fr)** - Français
- **Spanish (es)** - Español

## Architecture

### 1. Translation Files

- **Location**: `src/translations/index.ts`
- **Structure**: Nested object with language codes as keys
- **Categories**: Common terms, navigation, authentication, documents, users, errors, settings

### 2. Translation Hook

- **Location**: `src/hooks/useTranslation.ts`
- **Functions**:
  - `t(key)` - Basic translation
  - `tWithParams(key, params)` - Translation with parameters
  - `formatDate(date)` - Locale-specific date formatting
  - `formatNumber(number)` - Locale-specific number formatting

### 3. Language Switcher

- **Location**: `src/components/ui/LanguageSwitcher.tsx`
- **Features**: Dropdown with flags and language names
- **Placement**: Application header (Layout component)

### 4. Settings Context

- **Location**: `src/context/SettingsContext.tsx`
- **Features**: Language persistence in localStorage, browser language detection

## Implementation Steps

### Step 1: Import the Translation Hook

```typescript
import { useTranslation } from "@/hooks/useTranslation";

// In your component
const { t, tWithParams, formatDate, formatNumber } = useTranslation();
```

### Step 2: Replace Hardcoded Strings

#### Basic Text

```typescript
// Before
<h1>Dashboard</h1>

// After
<h1>{t('dashboard.title')}</h1>
```

#### Form Labels and Buttons

```typescript
// Before
<Button>Save</Button>
<Button>Cancel</Button>

// After
<Button>{t('common.save')}</Button>
<Button>{t('common.cancel')}</Button>
```

#### Input Placeholders

```typescript
// Before
<Input placeholder="Search users..." />

// After
<Input placeholder={t('users.searchUsers')} />
```

### Step 3: Dynamic Content with Parameters

```typescript
// Before
<p>Welcome back, {userName}!</p>

// After
<p>{tWithParams('documents.welcomeBack', { userName })}</p>
```

### Step 4: Date and Number Formatting

```typescript
// Before
<span>{new Date().toLocaleDateString()}</span>
<span>{count.toLocaleString()}</span>

// After
<span>{formatDate(new Date())}</span>
<span>{formatNumber(count)}</span>
```

### Step 5: Error Messages and Toast Notifications

```typescript
// Before
toast.error("An error occurred");

// After
toast.error(t("errors.generic"));
```

## Translation Key Structure

### Common Terms (`common.*`)

- `save`, `cancel`, `delete`, `edit`, `create`, `update`
- `search`, `filter`, `loading`, `error`, `success`
- `actions`, `status`, `date`, `time`, `name`, `description`

### Navigation (`nav.*`)

- `dashboard`, `documents`, `userManagement`
- `responsibilityCentres`, `settings`, `logout`

### Authentication (`auth.*`)

- `login`, `register`, `email`, `password`
- `forgotPassword`, `signIn`, `signUp`

### Documents (`documents.*`)

- `title`, `createDocument`, `editDocument`
- `noDocuments`, `searchDocuments`

### Users (`users.*`)

- `title`, `createUser`, `editUser`
- `username`, `email`, `role`, `status`

### Responsibility Centres (`responsibilityCentres.*`)

- `title`, `createCentre`, `editCentre`
- `centreCode`, `centreName`, `usersCount`

### Errors (`errors.*`)

- `generic`, `networkError`, `unauthorized`
- `forbidden`, `notFound`, `serverError`

## Adding New Translation Keys

1. **Add to English first** in `src/translations/index.ts`:

```typescript
export const translations = {
  en: {
    // ... existing keys
    newSection: {
      newKey: "New English Text",
    },
  },
};
```

2. **Add French translation**:

```typescript
fr: {
  // ... existing keys
  newSection: {
    newKey: "Nouveau Texte Français";
  }
}
```

3. **Add Spanish translation**:

```typescript
es: {
  // ... existing keys
  newSection: {
    newKey: "Nuevo Texto Español";
  }
}
```

## Components Already Updated

✅ **Completed**:

- `src/translations/index.ts` - Comprehensive translation keys
- `src/hooks/useTranslation.ts` - Translation hook with TypeScript support
- `src/components/ui/LanguageSwitcher.tsx` - Language switcher component
- `src/components/layout/Layout.tsx` - Added language switcher to header
- `src/components/navigation/SidebarNav.tsx` - Navigation translations
- `src/pages/ResponsibilityCentreManagement.tsx` - Partial implementation
- `src/pages/Login.tsx` - Partial implementation

## Components To Update

🔄 **In Progress**:

- `src/pages/Dashboard.tsx`
- `src/pages/UserManagement.tsx`
- `src/pages/Register.tsx`
- `src/pages/Settings.tsx` (has some translations)

📋 **Pending**:

- All dialog components
- All form components
- Error handling components
- Toast notifications throughout the app
- Table headers and data
- Modal dialogs and confirmations

## Best Practices

### 1. Consistent Key Naming

- Use camelCase for keys
- Group related keys under sections
- Use descriptive names

### 2. Parameter Naming

- Use clear parameter names in templates
- Example: `{{userName}}`, `{{count}}`, `{{date}}`

### 3. Fallback Handling

- Always provide fallback text
- Use English as the fallback language

### 4. TypeScript Support

- The translation hook provides full TypeScript support
- Invalid keys will show compile-time errors

### 5. Performance

- Translations are loaded once at startup
- No runtime fetching required
- Minimal bundle size impact

## Testing Different Languages

1. **Via Language Switcher**: Click the language dropdown in the header
2. **Via Settings Page**: Go to Settings > Language Settings
3. **Via Browser**: Set browser language to French or Spanish
4. **Via localStorage**: Set `language` key to 'en', 'fr', or 'es'

## Example Implementation

See `src/components/common/MultiLanguageTemplate.tsx` for a complete example showing all translation patterns.

## Troubleshooting

### TypeScript Errors

- Ensure all translation keys exist in the translations file
- Check for typos in key names
- Verify nested object structure

### Missing Translations

- Check browser console for warnings
- Add missing keys to all language objects
- Verify key paths are correct

### Language Not Switching

- Check localStorage for 'language' key
- Verify SettingsProvider is wrapping the app
- Check for JavaScript errors in console

## Future Enhancements

1. **RTL Language Support**: Add Arabic or Hebrew
2. **Pluralization**: Advanced plural forms for different languages
3. **Date/Time Formats**: More sophisticated locale-specific formatting
4. **Currency Formatting**: Locale-specific currency display
5. **Dynamic Loading**: Load translations on demand for better performance
