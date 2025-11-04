// Internationalization configuration for BillWise AI Nexus
// This file provides language switching and translation functionality

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// Language storage key
const LANGUAGE_STORAGE_KEY = 'billwise-language';

// Get current language from localStorage or default
export const getCurrentLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return (stored as SupportedLanguage) || DEFAULT_LANGUAGE;
};

// Set language in localStorage
export const setLanguage = (language: SupportedLanguage): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  
  // Dispatch custom event for language change
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language } 
  }));
};

// Get language direction (LTR/RTL)
export const getLanguageDirection = (language: SupportedLanguage): 'ltr' | 'rtl' => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

// Format numbers according to locale
export const formatNumber = (number: number, language: SupportedLanguage): string => {
  try {
    return new Intl.NumberFormat(language).format(number);
  } catch {
    return number.toString();
  }
};

// Format currency according to locale
export const formatCurrency = (amount: number, language: SupportedLanguage, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

// Format date according to locale
export const formatDate = (date: Date, language: SupportedLanguage): string => {
  try {
    return new Intl.DateTimeFormat(language).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};

// Format date and time according to locale
export const formatDateTime = (date: Date, language: SupportedLanguage): string => {
  try {
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

// Get plural form for a given count
export const getPluralForm = (count: number, language: SupportedLanguage): string => {
  try {
    const rules = new Intl.PluralRules(language);
    return rules.select(count);
  } catch {
    return count === 1 ? 'one' : 'other';
  }
};

// Translation function factory
export const createTranslationFunction = (translations: Record<string, any>) => {
  return (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }
    
    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    
    return value;
  };
};

// Load translations for a specific language
export const loadTranslations = async (language: SupportedLanguage): Promise<Record<string, any>> => {
  try {
    // Use dynamic import for Vite bundling - works in both dev and production
    const translations = await import(`./locales/${language}.json`);
    return translations.default || translations;
  } catch (error) {
    console.warn(`Failed to load translations for ${language}, falling back to English:`, error);
    
    // Fallback to English
    if (language !== 'en') {
      try {
        const translations = await import(`./locales/en.json`);
        return translations.default || translations;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError);
      }
    }
    
    // Return empty translations as last resort
    return {};
  }
};

// Initialize i18n
export const initializeI18n = async (): Promise<void> => {
  const currentLanguage = getCurrentLanguage();
  
  // Set document language
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = getLanguageDirection(currentLanguage);
  }
  
  // Load translations
  try {
    await loadTranslations(currentLanguage);
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
  }
};

// Export default configuration
export default {
  getCurrentLanguage,
  setLanguage,
  getLanguageDirection,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  getPluralForm,
  createTranslationFunction,
  loadTranslations,
  initializeI18n,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
};
