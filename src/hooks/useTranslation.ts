import { useState, useEffect } from 'react';
import { 
  getCurrentLanguage, 
  setLanguage, 
  loadTranslations, 
  createTranslationFunction,
  type SupportedLanguage 
} from '@/i18n';

// Translation hook for BillWise AI Nexus
export const useTranslation = () => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getCurrentLanguage());
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Load translations
  useEffect(() => {
    const loadTranslationsForLanguage = async () => {
      setLoading(true);
      try {
        const data = await loadTranslations(currentLang);
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslationsForLanguage();
  }, [currentLang]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail.language as SupportedLanguage;
      setCurrentLang(newLanguage);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  // Translation function
  const t = createTranslationFunction(translations);

  // Change language
  const changeLanguage = (language: SupportedLanguage) => {
    setLanguage(language);
    setCurrentLang(language);
  };

  // Format functions
  const formatNumber = (number: number) => {
    try {
      return new Intl.NumberFormat(currentLang).format(number);
    } catch {
      return number.toString();
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    try {
      return new Intl.NumberFormat(currentLang, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat(currentLang).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  };

  const formatDateTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat(currentLang, {
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

  return {
    t,
    currentLang,
    changeLanguage,
    loading,
    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
  };
};
