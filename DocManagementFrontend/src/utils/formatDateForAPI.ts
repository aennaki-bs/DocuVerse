/**
 * Formats a date for API calls.
 * @param date The date to format (can be a Date object or string)
 * @returns The formatted date string in ISO format (date only, no time)
 */
export const formatDateForAPI = (date: Date | string): string => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Normalize to avoid timezone issues - use local date components
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    // Return date in YYYY-MM-DD format for consistency
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`[DEBUG] formatDateForAPI: input=${date}, output=${formattedDate}`);
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return '';
  }
};