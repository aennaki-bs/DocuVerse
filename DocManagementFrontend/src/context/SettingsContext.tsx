import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type Language = "en" | "fr" | "es";

interface SettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Default to dark mode as standard
    return "dark";
  });

  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang === "en" || savedLang === "fr" || savedLang === "es") {
      return savedLang;
    }

    // Try to detect browser language
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "fr" || browserLang === "es") {
      return browserLang as Language;
    }

    return "en";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Apply theme class to document element
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Also set a data attribute for potential CSS selectors
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  return (
    <SettingsContext.Provider
      value={{ theme, setTheme, language, setLanguage }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
