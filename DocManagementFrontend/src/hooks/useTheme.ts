import { useEffect, useState } from 'react';
import { type Theme, type BaseTheme, resolveTheme } from '@/lib/themes';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // Default to dark theme (standard theme now uses dark mode)
    return 'dark';
  });
  
  // Calculate the current active theme (resolve named themes to base themes)
  const currentActiveTheme = resolveTheme(theme);
  
  // Update the DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('light', 'dark');
    
    // Add the current active theme class
    root.classList.add(currentActiveTheme);
    
    // Set the data-theme attribute for named themes
    if (theme === 'standard') {
      root.setAttribute('data-theme', 'standard');
    } else {
      root.removeAttribute('data-theme');
    }
    
    // Save the theme preference
    localStorage.setItem('theme', theme);
  }, [theme, currentActiveTheme]);
  
  // Function to change the theme
  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return { theme, setTheme: setThemePreference, currentActiveTheme };
} 