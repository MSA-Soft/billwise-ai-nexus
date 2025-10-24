import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

export const LanguageSelector: React.FC = () => {
  const { currentLang, changeLanguage, loading } = useTranslation();

  const handleLanguageChange = (language: string) => {
    changeLanguage(language as SupportedLanguage);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4" />
        <div className="w-40 h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4" />
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
