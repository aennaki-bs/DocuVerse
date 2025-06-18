/**
 * Formats a date for API calls.
 * @param date The date to format (can be a Date object or string)
 * @returns The formatted date string in ISO format
 */
export const formatDateForAPI = (date: Date | string): string => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return '';
  }
};