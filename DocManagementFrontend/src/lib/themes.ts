export type BaseTheme = 'light' | 'dark';
export type NamedTheme = 'standard';
export type Theme = BaseTheme | NamedTheme;

// Theme configurations mapping named themes to base themes
export const themeConfigurations = {
  standard: 'dark' as BaseTheme, // Standard theme uses dark mode styling
} as const;

// Theme definitions for display purposes
export const themeDefinitions = {
  light: {
    name: 'Light',
    description: 'Blue and white theme with clean, professional styling',
  },
  dark: {
    name: 'Dark', 
    description: 'Dark theme with muted colors',
  },
  standard: {
    name: 'Standard Theme',
    description: 'Default DocuVerse dark theme with optimized colors and spacing',
  },
} as const;

// Helper function to resolve theme to base theme
export function resolveTheme(theme: Theme): BaseTheme {
  if (theme === 'standard') {
    return themeConfigurations.standard;
  }
  
  return theme as BaseTheme;
}

// Helper function to get theme display name
export function getThemeDisplayName(theme: Theme): string {
  return themeDefinitions[theme]?.name || theme;
}

// Helper function to get theme description
export function getThemeDescription(theme: Theme): string {
  return themeDefinitions[theme]?.description || '';
} 