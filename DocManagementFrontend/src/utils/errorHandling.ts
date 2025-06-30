/**
 * Utility functions for comprehensive error handling
 */

export interface ErrorInfo {
  message: string;
  statusCode?: number;
  isUserFriendly: boolean;
}

/**
 * Extracts a comprehensive error message from various error formats
 * @param error - The error object from axios or other sources
 * @param defaultMessage - Default message if no error can be extracted
 * @returns ErrorInfo object with message and metadata
 */
export function extractErrorMessage(error: any, defaultMessage: string = "An unexpected error occurred"): ErrorInfo {
  let message = defaultMessage;
  let statusCode: number | undefined;
  let isUserFriendly = false;

  if (error.response) {
    statusCode = error.response.status;
    
    // Try to extract message from response data
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
        isUserFriendly = true;
      } else if (error.response.data.message) {
        message = error.response.data.message;
        isUserFriendly = true;
      } else if (error.response.data.error) {
        message = error.response.data.error;
        isUserFriendly = true;
      }
    }
  } else if (error.message) {
    message = error.message;
  }

  return {
    message,
    statusCode,
    isUserFriendly
  };
}

/**
 * Maps HTTP status codes to user-friendly messages for email operations
 * @param statusCode - HTTP status code
 * @param originalMessage - Original error message from server
 * @param operation - Type of operation (e.g., 'email-update', 'user-creation')
 * @returns User-friendly error message
 */
export function getStatusCodeMessage(
  statusCode: number, 
  originalMessage: string = "", 
  operation: string = "operation"
): string {
  // Check for specific error content first
  const lowerMessage = originalMessage.toLowerCase();
  
  // Email-specific errors
  if (operation.includes('email')) {
    if (lowerMessage.includes('email already in use') || 
        lowerMessage.includes('email is already in use') ||
        lowerMessage.includes('already registered')) {
      return "This email address is already registered in the system. Please choose a different email.";
    }
    
    if (lowerMessage.includes('email is required') || 
        lowerMessage.includes('email required')) {
      return "Email address is required.";
    }
    
    if (lowerMessage.includes('invalid') && lowerMessage.includes('email')) {
      return "Please enter a valid email address.";
    }
  }

  // User management errors
  if (operation.includes('user')) {
    if (lowerMessage.includes('username already in use') || 
        lowerMessage.includes('username is already taken')) {
      return "This username is already taken. Please choose a different username.";
    }
    
    if (lowerMessage.includes('password') && lowerMessage.includes('characters')) {
      return "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character.";
    }
  }

  // Generic status code mappings
  switch (statusCode) {
    case 400:
      if (lowerMessage.includes('request failed')) {
        return `Invalid request. Please check your input and try again.`;
      }
      return originalMessage || `Invalid request. Please check your input and try again.`;
      
    case 401:
      return "Your session has expired. Please log in again.";
      
    case 403:
      return "You don't have permission to perform this action.";
      
    case 404:
      if (operation.includes('user')) {
        return "User not found. The user may have been deleted.";
      }
      return "The requested resource was not found.";
      
    case 409:
      if (operation.includes('email')) {
        return "This email address is already registered in the system. Please choose a different email.";
      }
      if (operation.includes('user')) {
        return "A user with this information already exists.";
      }
      return "Conflict: The resource already exists.";
      
    case 422:
      return "The provided data is invalid. Please check your input and try again.";
      
    case 429:
      return "Too many requests. Please wait a moment before trying again.";
      
    case 500:
      return `Server error occurred. Please try again later.`;
      
    case 502:
      return "Service temporarily unavailable. Please try again in a few moments.";
      
    case 503:
      return "Service temporarily unavailable. Please try again in a few moments.";
      
    case 504:
      return "Request timeout. Please try again.";
      
    default:
      return originalMessage || `An error occurred (Code: ${statusCode}). Please try again.`;
  }
}

/**
 * Gets a comprehensive, user-friendly error message
 * @param error - The error object
 * @param operation - Type of operation for context-specific messages
 * @param defaultMessage - Fallback message
 * @returns User-friendly error message
 */
export function getComprehensiveErrorMessage(
  error: any, 
  operation: string = "operation",
  defaultMessage: string = "An unexpected error occurred"
): string {
  const errorInfo = extractErrorMessage(error, defaultMessage);
  
  if (errorInfo.statusCode) {
    return getStatusCodeMessage(errorInfo.statusCode, errorInfo.message, operation);
  }
  
  return errorInfo.message;
}

/**
 * Formats error for display in toasts or alerts
 * @param error - The error object
 * @param operation - Type of operation
 * @returns Object with title and message for display
 */
export function formatErrorForDisplay(error: any, operation: string = "operation"): {
  title: string;
  message: string;
  statusCode?: number;
} {
  const errorInfo = extractErrorMessage(error);
  const comprehensiveMessage = getComprehensiveErrorMessage(error, operation);
  
  // Generate appropriate title based on operation
  let title = "Error";
  if (operation.includes('email')) {
    title = "Email Update Failed";
  } else if (operation.includes('user')) {
    title = "User Operation Failed";
  } else if (operation.includes('create')) {
    title = "Creation Failed";
  } else if (operation.includes('update')) {
    title = "Update Failed";
  } else if (operation.includes('delete')) {
    title = "Deletion Failed";
  }
  
  return {
    title,
    message: comprehensiveMessage,
    statusCode: errorInfo.statusCode
  };
} 