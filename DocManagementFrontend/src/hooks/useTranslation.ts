import { useSettings } from '@/context/SettingsContext';
import { translations } from '@/translations';

type Language = 'en' | 'fr' | 'es';

// Helper type to get nested object paths
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof translations.en>;

export const useTranslation = () => {
  const { language } = useSettings();

  // Get translation by key (supports dot notation for nested objects)
  const t = (key: TranslationKey, fallback?: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language as Language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // If key doesn't exist, try English as fallback
          value = translations.en;
          for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
              value = value[k];
            } else {
              return fallback || key;
            }
          }
          break;
        }
      }
      
      return typeof value === 'string' ? value : fallback || key;
    } catch (error) {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return fallback || key;
    }
  };

  // Get current language
  const getCurrentLanguage = (): Language => {
    return language as Language;
  };

  // Get all available languages
  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];
  };

  // Format date according to current language
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(dateObj);
  };

  // Format numbers according to current language
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES';
    
    return new Intl.NumberFormat(locale, options).format(number);
  };

  // Get translation with interpolation support
  const tWithParams = (key: TranslationKey, params: Record<string, string | number> = {}, fallback?: string): string => {
    let translation = t(key, fallback);
    
    // Replace placeholders with actual values
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(value));
    });
    
    return translation;
  };

  return {
    t,
    tWithParams,
    getCurrentLanguage,
    getAvailableLanguages,
    formatDate,
    formatNumber,
    language: getCurrentLanguage(),
  };
}; 