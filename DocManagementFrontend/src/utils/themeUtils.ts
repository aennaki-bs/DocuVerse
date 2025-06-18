// Theme utility functions for consistent theming across components

export const getThemeClasses = {
  // Card backgrounds
  card: "bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30",
  cardSecondary: "bg-blue-50 border-blue-300 dark:bg-[#0f1642] dark:border-blue-900/30",
  cardDialog: "bg-white border-blue-200 dark:bg-[#1e2a4a] dark:border-blue-900/40",
  
  // Input fields
  input: "bg-blue-50 border-blue-200 text-blue-900 placeholder:text-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-[#081029] dark:border-blue-900/50 dark:text-white dark:placeholder:text-blue-300/50 dark:focus:border-blue-500/50",
  inputWithIcon: "pl-10 h-10 w-full rounded-md transition-all duration-200 bg-blue-50 border-blue-200 text-blue-900 placeholder:text-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-[#081029] dark:border-blue-900/50 dark:text-white dark:placeholder:text-blue-300/50 dark:focus:border-blue-500/50",
  
  // Select components
  selectTrigger: "bg-blue-50 border-blue-200 text-blue-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#22306e] dark:text-blue-100 dark:border-blue-900/40 dark:focus:ring-blue-500 dark:focus:border-blue-500",
  selectContent: "bg-white border-blue-200 dark:bg-[#22306e] dark:text-blue-100 dark:border-blue-900/40",
  selectItem: "text-blue-900 focus:bg-blue-100 dark:text-blue-100 dark:focus:bg-blue-800/30",
  
  // Table components
  tableHeader: "bg-blue-100 border-blue-200 dark:bg-[#1a2c6b] dark:border-blue-900/30",
  tableRow: "border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-[#192257]/60",
  tableRowEven: "bg-blue-25 dark:bg-[#0f1642]/40",
  
  // Button variants
  buttonPrimary: "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700",
  buttonSecondary: "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300 dark:bg-[#22306e] dark:text-blue-100 dark:border-blue-900/40 dark:hover:bg-blue-800/40",
  
  // Text colors
  textPrimary: "text-blue-900 dark:text-blue-100",
  textSecondary: "text-blue-700 dark:text-blue-300",
  textMuted: "text-blue-600 dark:text-blue-400",
  
  // Backgrounds for different components
  pageBackground: "bg-blue-25 dark:bg-[#070b28]",
  modalBackground: "bg-white dark:bg-[#0a1033]",
  sidebarBackground: "bg-blue-50 dark:bg-[#0f1642]",
  
  // Tooltip and popover
  tooltip: "bg-white border-blue-200 text-blue-900 dark:bg-[#0a1033]/90 dark:border-blue-900/50 dark:text-blue-100",
  
  // Badge variants
  badgeSuccess: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  badgeWarning: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  badgeError: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  badgeInfo: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
};

// Helper function to combine theme classes
export const themeClass = (...classes: string[]) => classes.join(" ");

// Helper function to get conditional theme classes
export const conditionalThemeClass = (lightClass: string, darkClass: string) => 
  `${lightClass} dark:${darkClass}`; 