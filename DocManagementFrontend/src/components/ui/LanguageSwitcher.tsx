import React from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettings } from "@/context/SettingsContext";

export const LanguageSwitcher: React.FC = () => {
  const { getAvailableLanguages, getCurrentLanguage } = useTranslation();
  const { setLanguage } = useSettings();

  const currentLanguage = getCurrentLanguage();
  const languages = getAvailableLanguages();

  const currentLangData = languages.find(
    (lang) => lang.code === currentLanguage
  );

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as "en" | "fr" | "es");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-blue-100 hover:bg-blue-800/30 hover:text-blue-50"
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLangData?.flag}</span>
          <span className="text-sm">{currentLangData?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white border-blue-200 dark:bg-[#0f1642] dark:border-blue-900/30"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between px-3 py-2 text-blue-100 hover:bg-blue-800/30 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-blue-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
