import { toast } from 'sonner';

// Helper function to extract error message from various API response formats
export const getErrorMessage = (error: any): string => {
  // If there's no response, it's likely a network error
  if (!error.response) {
    return error.message || 'Network error. Please try again later.';
  }

  // Get the response data
  const { data, status } = error.response;
  
  // Special handling for 401 Unauthorized errors
  if (status === 401) {
    // Handle specific 401 error cases
    if (error.config?.url?.includes('/Auth/register') && 
        (typeof data === 'string' && data.includes('admin secret'))) {
      return "Invalid admin secret. Please check your admin key or unselect the admin option.";
    }
    
    // Generic unauthorized message
    return data || "Unauthorized. Please check your credentials.";
  }
  
  // Special handling for 404 Not Found errors
  if (status === 404) {
    // Check if it's a search operation (this can be expanded based on URL patterns)
    const isSearch = error.config?.url?.includes('search') || 
                     error.config?.params?.search || 
                     error.config?.params?.q;
                     
    if (isSearch) {
      return 'No results found. Try different search criteria.';
    }
    return 'Resource not found.';
  }
  
  // Handle different error formats from the API
  if (typeof data === 'string') {
    return data;
  }
  
  if (data?.message) {
    return data.message;
  }
  
  if (data?.error) {
    return data.error;
  }
  
  if (data?.errors) {
    // If it's an array of errors, join them
    if (Array.isArray(data.errors)) {
      return data.errors.join('. ');
    }
    // If it's an object with error properties
    if (typeof data.errors === 'object') {
      return Object.values(data.errors).flat().join('. ');
    }
    return data.errors.toString();
  }
  
  // Return status-specific messages
  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'Unauthorized. Please check your credentials.';
    case 403:
      return 'Forbidden. You do not have permission to access this resource.';
    case 404:
      return 'Resource not found.';
    case 500: 
      return 'Server error. Please try again later.';
    default:
      return `Error ${status}: ${data || 'Unknown error'}`;
  }
};

// Function to handle error response
export const handleErrorResponse = (error: any, skipToast: boolean = false): Promise<never> => {
  // Check for specific user creation errors first
  const userCreationError = getUserCreationErrorMessage(error);
  
  // Extract detailed error message from response if available
  const errorMessage = userCreationError || getErrorMessage(error);
  
  // Determine the type of notification to show
  const isNotFoundError = error.response?.status === 404;
  const isSearchOperation = error.config?.url?.includes('search') || 
                           error.config?.params?.search || 
                           error.config?.params?.q;
                     
  // Only show toast for endpoints that don't handle their own errors
  if (!skipToast && errorMessage) {
    if (isNotFoundError && isSearchOperation) {
      // Use info toast for search with no results
      toast.info('Search Results', {
        description: 'No matching results found. Try different search criteria.'
      });
    } else {
      // Use error toast for other errors
      toast.error('API Error', {
        description: errorMessage
      });
    }
  }
  
  return Promise.reject(error);
};

// Check if endpoint should skip authentication redirect
export const shouldSkipAuthRedirect = (url: string): boolean => {
  const noRedirectEndpoints = [
    '/Auth/login', 
    '/Auth/register',
    '/Account/forgot-password',
    '/Account/update-password',
    '/Account/resend-code',
    '/Auth/verify-email',
    '/Auth/valide-email', 
    '/Auth/valide-username'
  ];
  
  return noRedirectEndpoints.some(endpoint => url.includes(endpoint));
};

// Check if endpoint should skip error toast
export const shouldSkipErrorToast = (url: string): boolean => {
  return url.includes('/Auth/login') || 
         url.includes('/Auth/register') ||
         url.includes('/Auth/valide-email') ||
         url.includes('/Auth/valide-username') ||
         url.includes('/Auth/verify-email') ||
         url.includes('/Account/resend-code');
};

// Helper function to get specific error message for Admin/user operations
export const getUserCreationErrorMessage = (error: any): string | null => {
  if (!error.response) return null;
  
  const { data, status } = error.response;
  
  // User creation specific errors
  if (error.config?.url?.includes('/Admin/users')) {
    if (typeof data === 'string') {
      if (data.includes('Email is already in use')) {
        return 'This email address is already registered.';
      }
      if (data.includes('Username is already in use')) {
        return 'This username is already taken.';
      }
      return data; // Return the original error message
    }
    
    // Generic error based on status
    switch (status) {
      case 400:
        return 'Invalid user data. Please check all fields and try again.';
      case 409:
        return 'User with this email or username already exists.';
      case 500:
        return 'Server error while creating user. Please try again later.';
    }
  }
  
  return null;
}
