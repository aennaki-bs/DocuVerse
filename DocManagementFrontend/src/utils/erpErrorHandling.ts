import { toast } from 'sonner';

export interface ErpError {
  message?: string;
  errorDetails?: string;
  errorType?: string;
  statusCode?: number;
}

// Helper function to get user-friendly error titles based on error type
export const getErpErrorTitle = (errorType?: string): string => {
  switch (errorType) {
    case 'NetworkError':
      return 'Connection Error';
    case 'TimeoutError':
      return 'Request Timeout';
    case 'ValidationError':
      return 'Data Validation Error';
    case 'AuthenticationError':
      return 'Authentication Failed';
    case 'AuthorizationError':
      return 'Access Denied';
    case 'NotFoundError':
      return 'Resource Not Found';
    case 'ServerError':
      return 'Server Error';
    case 'ServiceUnavailableError':
      return 'Service Unavailable';
    case 'ErpArchivalError':
      return 'Document Archival Failed';
    case 'ErpLineCreationError':
      return 'Line Creation Failed';
    default:
      return 'ERP Operation Failed';
  }
};

// Helper function to get additional help text based on error type
export const getErpErrorHelp = (errorType?: string): string | undefined => {
  switch (errorType) {
    case 'NetworkError':
      return 'Please check your internet connection and try again.';
    case 'TimeoutError':
      return 'The operation took too long. Business Central may be busy, please try again later.';
    case 'ValidationError':
      return 'Please verify all data is complete and valid before trying again.';
    case 'AuthenticationError':
      return 'Please contact your administrator to check ERP system credentials.';
    case 'AuthorizationError':
      return 'You may not have sufficient permissions in Business Central. Contact your administrator.';
    case 'NotFoundError':
      return 'Please verify that all referenced codes exist in Business Central.';
    case 'ServerError':
      return 'Business Central encountered an internal error. Please try again later.';
    case 'ServiceUnavailableError':
      return 'Business Central service is temporarily unavailable. Please try again later.';
    case 'ErpArchivalError':
      return 'The document could not be archived to the ERP system. Please check document data and try again.';
    case 'ErpLineCreationError':
      return 'Some document lines could not be created in the ERP system. Please verify line data.';
    default:
      return 'Please try again or contact support if the problem persists.';
  }
};

// Helper function to get specific user actions based on error type
export const getErpErrorActions = (errorType?: string): string[] => {
  switch (errorType) {
    case 'NetworkError':
      return [
        'Check your internet connection',
        'Verify VPN connection if required',
        'Try again in a few moments'
      ];
    case 'TimeoutError':
      return [
        'Wait a few minutes for the system to be less busy',
        'Try the operation again',
        'Contact support if timeouts persist'
      ];
    case 'ValidationError':
      return [
        'Verify all required fields are filled',
        'Check that item/account codes exist in Business Central',
        'Ensure dates are within valid ranges',
        'Validate unit of measure codes'
      ];
    case 'AuthenticationError':
      return [
        'Contact your system administrator',
        'Verify Business Central credentials are configured',
        'Check if your account has ERP access'
      ];
    case 'AuthorizationError':
      return [
        'Contact your system administrator',
        'Request Business Central permissions',
        'Verify your user role includes ERP operations'
      ];
    case 'NotFoundError':
      return [
        'Verify item codes exist in Business Central',
        'Check account codes are valid',
        'Ensure customer/vendor codes are correct',
        'Validate location and unit of measure codes'
      ];
    default:
      return [
        'Try the operation again',
        'Contact support if the problem persists'
      ];
  }
};

// Main function to display ERP errors with enhanced information
export const showErpError = (
  error: ErpError, 
  operation: string = 'ERP operation',
  options: {
    duration?: number;
    showActions?: boolean;
    showStatusCode?: boolean;
  } = {}
) => {
  const { duration = 8000, showActions = false, showStatusCode = true } = options;
  
  const errorTitle = getErpErrorTitle(error.errorType);
  const errorHelp = getErpErrorHelp(error.errorType);
  const errorActions = getErpErrorActions(error.errorType);
  
  // Primary error message from the server
  const primaryMessage = error.message || `Failed to complete ${operation}`;
  
  // Build description with additional context
  let description = primaryMessage;
  
  if (errorHelp) {
    description += `\n\n${errorHelp}`;
  }
  
  if (showActions && errorActions.length > 0) {
    description += `\n\nSuggested actions:\n${errorActions.map(action => `• ${action}`).join('\n')}`;
  }
  
  // Show status code if it might be helpful for troubleshooting
  if (showStatusCode && error.statusCode && error.statusCode >= 500) {
    description += `\n\nError Code: ${error.statusCode}`;
  }
  
  toast.error(errorTitle, {
    description: description,
    duration: duration
  });
};

// Function to handle network errors consistently
export const showNetworkError = (operation: string = 'operation') => {
  toast.error('Connection Error', {
    description: `Unable to connect to the server while performing ${operation}. Please check your connection and try again.`,
    duration: 6000
  });
};

// Function to extract error information from API responses
export const extractErpError = (error: any, operation: string): ErpError => {
  // Check if it's a network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: `Network error during ${operation}`,
      errorType: 'NetworkError'
    };
  }
  
  // Check if it's an API response error
  if (error.response) {
    const { data, status } = error.response;
    
    return {
      message: data?.message || `Failed to complete ${operation}`,
      errorDetails: data?.errorDetails,
      errorType: data?.errorType,
      statusCode: status
    };
  }
  
  // Generic error
  return {
    message: error.message || `An unexpected error occurred during ${operation}`,
    errorType: 'UnexpectedError'
  };
};

// Function to check if an error is retryable
export const isRetryableError = (errorType?: string): boolean => {
  const retryableErrors = [
    'NetworkError',
    'TimeoutError',
    'ServerError',
    'ServiceUnavailableError'
  ];
  
  return retryableErrors.includes(errorType || '');
};

// Function to get retry delay based on error type
export const getRetryDelay = (errorType?: string, attempt: number = 1): number => {
  switch (errorType) {
    case 'NetworkError':
      return Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff up to 10s
    case 'TimeoutError':
      return Math.min(5000 * attempt, 30000); // Linear increase up to 30s
    case 'ServerError':
    case 'ServiceUnavailableError':
      return Math.min(2000 * attempt, 15000); // Linear increase up to 15s
    default:
      return 5000; // Default 5 second delay
  }
}; 