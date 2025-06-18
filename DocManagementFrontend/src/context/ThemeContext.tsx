import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeVariant =
  | "standard" // Classic blue theme (your original)
  | "ocean-blue" // Your current favorite blue theme
  | "dark-neutral" // Professional neutral theme
  | "emerald-green" // Nature-inspired green
  | "purple-haze" // Creative purple theme
  | "orange-sunset"; // Warm orange theme

export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  variant: ThemeVariant;
  mode: ThemeMode;
  autoMode: boolean; // Follow system preference
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  setVariant: (variant: ThemeVariant) => void;
  setAutoMode: (auto: boolean) => void;
  availableThemes: Array<{
    id: ThemeVariant;
    name: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const THEME_STORAGE_KEY = "app-theme-config";

// Define available themes with metadata
const AVAILABLE_THEMES = [
  {
    id: "standard" as ThemeVariant,
    name: "Standard",
    description: "Classic blue theme with traditional styling",
    colors: {
      primary: "#2563eb",
      secondary: "#1d4ed8",
      accent: "#3b82f6",
    },
  },
  {
    id: "ocean-blue" as ThemeVariant,
    name: "Ocean Blue",
    description: "Professional blue theme with ocean vibes",
    colors: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
    },
  },
  {
    id: "dark-neutral" as ThemeVariant,
    name: "Dark Neutral",
    description: "Clean, professional neutral theme",
    colors: {
      primary: "#171717",
      secondary: "#262626",
      accent: "#404040",
    },
  },
  {
    id: "emerald-green" as ThemeVariant,
    name: "Emerald Green",
    description: "Fresh, nature-inspired green theme",
    colors: {
      primary: "#059669",
      secondary: "#047857",
      accent: "#10b981",
    },
  },
  {
    id: "purple-haze" as ThemeVariant,
    name: "Purple Haze",
    description: "Creative and modern purple theme",
    colors: {
      primary: "#8b5cf6",
      secondary: "#7c3aed",
      accent: "#a78bfa",
    },
  },
  {
    id: "orange-sunset" as ThemeVariant,
    name: "Orange Sunset",
    description: "Warm and energetic orange theme",
    colors: {
      primary: "#ea580c",
      secondary: "#c2410c",
      accent: "#fb923c",
    },
  },
] as const;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          variant: parsed.variant || "ocean-blue",
          mode: parsed.mode || "dark",
          autoMode: parsed.autoMode ?? false,
        };
      } catch {
        // Fall back to defaults if parsing fails
      }
    }

    return {
      variant: "standard",
      mode: "dark",
      autoMode: false,
    };
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set theme variant
    root.setAttribute("data-theme", theme.variant);

    // Set theme mode
    if (theme.autoMode) {
      // Follow system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme.mode === "dark");
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  // Listen for system theme changes when auto mode is enabled
  useEffect(() => {
    if (!theme.autoMode) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      root.classList.toggle("dark", mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme.autoMode]);

  const setTheme = (updates: Partial<ThemeConfig>) => {
    setThemeState((prev) => ({ ...prev, ...updates }));
  };

  const toggleMode = () => {
    setTheme({
      mode: theme.mode === "light" ? "dark" : "light",
      autoMode: false, // Disable auto mode when manually toggling
    });
  };

  const setVariant = (variant: ThemeVariant) => {
    setTheme({ variant });
  };

  const setAutoMode = (autoMode: boolean) => {
    setTheme({ autoMode });
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleMode,
    setVariant,
    setAutoMode,
    availableThemes: [...AVAILABLE_THEMES],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
