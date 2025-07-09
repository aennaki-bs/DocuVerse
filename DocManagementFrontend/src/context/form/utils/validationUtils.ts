
import authService from '@/services/authService';
import { toast } from 'sonner';
import { SetStepValidation } from '../types';

// Cache for username validation results to reduce API calls
const usernameValidationCache = new Map<string, boolean>();
// Debounce timeout reference
let usernameValidationTimeout: NodeJS.Timeout | null = null;
// Track ongoing validations to prevent duplicates
const ongoingUsernameValidations = new Set<string>();

export const validateUsername = async (
  username: string, 
  setStepValidation: SetStepValidation,
  manageLoadingState: boolean = true
): Promise<boolean> => {
  // Skip validation for empty usernames
  if (!username || username.trim().length < 4) {
    return false;
  }
  
  // Check if validation is already in progress for this username
  if (ongoingUsernameValidations.has(username)) {
    console.log('Username validation already in progress for:', username);
    return false;
  }
  
  // Check cache first
  if (usernameValidationCache.has(username)) {
    const isValid = usernameValidationCache.get(username);
    if (!isValid) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, username: 'Username already taken.' },
      }));
    }
    return isValid || false;
  }
  
  // Add to ongoing validations
  ongoingUsernameValidations.add(username);
  
  if (manageLoadingState) {
    setStepValidation((prev) => ({ ...prev, isLoading: true, errors: { ...prev.errors, username: '' } }));
  }
  
  try {
    const isValid = await authService.validateUsername(username);
    
    // Cache the result
    usernameValidationCache.set(username, isValid);
    
    if (!isValid) {
      setStepValidation((prev) => ({
        ...prev,
        isLoading: manageLoadingState ? false : prev.isLoading,
        errors: { ...prev.errors, username: 'Username already taken.' },
      }));
      return false;
    }
    
    setStepValidation((prev) => ({ 
      ...prev, 
      isLoading: manageLoadingState ? false : prev.isLoading,
      errors: { ...prev.errors, username: '' }
    }));
    return true;
  } catch (error: any) {
    console.error('Username validation error:', error);
    
    // Determine appropriate error message
    let errorMessage = 'Username validation failed.';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    // Cache invalid usernames to avoid repeated API calls
    usernameValidationCache.set(username, false);
    
    setStepValidation((prev) => ({
      ...prev,
      isLoading: manageLoadingState ? false : prev.isLoading,
      errors: { ...prev.errors, username: errorMessage },
    }));
    return false;
  } finally {
    // Remove from ongoing validations
    ongoingUsernameValidations.delete(username);
  }
};

// Function to debounce username validation
export const debounceUsernameValidation = (
  username: string,
  setStepValidation: SetStepValidation,
  delay = 500
): void => {
  // Skip validation for empty or too short usernames
  if (!username || username.trim().length < 4) {
    return;
  }
  
  // Clear previous timeout
  if (usernameValidationTimeout) {
    clearTimeout(usernameValidationTimeout);
  }
  
  // Set new timeout
  usernameValidationTimeout = setTimeout(() => {
    validateUsername(username, setStepValidation);
  }, delay);
};

// Cache for email validation results
const emailValidationCache = new Map<string, boolean>();
// Debounce timeout reference
let emailValidationTimeout: NodeJS.Timeout | null = null;

// Track ongoing validations to prevent duplicates
const ongoingEmailValidations = new Set<string>();

// Fast email validation (only checks database, not external existence)
export const validateEmail = async (
  email: string,
  setStepValidation: SetStepValidation,
  manageLoadingState: boolean = true
): Promise<boolean> => {
  // Skip validation for empty emails or invalid format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }
  
  // Check if validation is already in progress for this email
  if (ongoingEmailValidations.has(email)) {
    console.log('Email validation already in progress for:', email);
    return false;
  }
  
  // Check cache first
  if (emailValidationCache.has(email)) {
    const isValid = emailValidationCache.get(email);
    if (!isValid) {
      setStepValidation((prev) => ({
        ...prev,
        errors: { ...prev.errors, email: 'Email already registered.' },
      }));
    }
    return isValid || false;
  }
  
  // Add to ongoing validations
  ongoingEmailValidations.add(email);
  
  if (manageLoadingState) {
    setStepValidation((prev) => ({ ...prev, isLoading: true, errors: { ...prev.errors, email: '' } }));
  }
  
  try {
    // Only check database availability, not external existence
    const isValid = await authService.validateEmail(email);
    
    // Cache the result
    emailValidationCache.set(email, isValid);
    
    if (!isValid) {
      setStepValidation((prev) => ({
        ...prev,
        isLoading: manageLoadingState ? false : prev.isLoading,
        errors: { ...prev.errors, email: 'Email already registered.' },
      }));
      if (manageLoadingState) {
        toast.error('Email validation failed. This email may already be registered.');
      }
      return false;
    }
    
    setStepValidation((prev) => ({ 
      ...prev, 
      isLoading: manageLoadingState ? false : prev.isLoading,
      errors: { ...prev.errors, email: '' }
    }));
    return true;
  } catch (error: any) {
    console.error('Email validation error:', error);
    
    // Determine appropriate error message based on error type
    let errorMessage = 'Email validation failed.';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    // Cache invalid emails to avoid repeated API calls
    emailValidationCache.set(email, false);
    
    setStepValidation((prev) => ({
      ...prev,
      isLoading: manageLoadingState ? false : prev.isLoading,
      errors: { ...prev.errors, email: errorMessage },
    }));
    if (manageLoadingState) {
      toast.error(errorMessage);
    }
    return false;
  } finally {
    // Remove from ongoing validations
    ongoingEmailValidations.delete(email);
  }
};

// Cache for email existence verification results
const emailExistenceCache = new Map<string, boolean>();
// Track ongoing email existence verifications to prevent duplicates
const ongoingEmailExistenceVerifications = new Set<string>();

// Verify email existence and availability (calls external API - use only on form submission)
export const verifyEmailExists = async (
  email: string,
  setStepValidation: SetStepValidation,
  manageLoadingState: boolean = true
): Promise<boolean> => {
  try {
    console.log('VerifyEmailExists function called with email:', email);
    
    // Check if verification is already in progress for this email
    if (ongoingEmailExistenceVerifications.has(email)) {
      console.log('Email existence verification already in progress for:', email);
      return false;
    }
    
    // Check cache first
    if (emailExistenceCache.has(email)) {
      const isValid = emailExistenceCache.get(email);
      console.log('Email existence verification result from cache:', isValid);
      if (!isValid) {
        setStepValidation((prev) => ({
          ...prev,
          errors: { ...prev.errors, email: 'Email verification failed.' },
        }));
      }
      return isValid || false;
    }
    
    // Add to ongoing verifications
    ongoingEmailExistenceVerifications.add(email);
    
    if (manageLoadingState) {
      setStepValidation((prev) => ({ ...prev, isLoading: true, errors: { ...prev.errors, email: '' } }));
    }
    
    console.log('Making API call to verify email existence and availability');
    const isAvailable = await authService.verifyEmailExists(email);
    console.log('API call completed, result:', isAvailable);
    
    // Cache the result
    emailExistenceCache.set(email, isAvailable);
    
    setStepValidation((prev) => ({ 
      ...prev, 
      isLoading: manageLoadingState ? false : prev.isLoading,
      errors: { ...prev.errors, email: '' }
    }));
    
    return isAvailable;
  } catch (error: any) {
    console.error('Email existence verification error:', error);
    
    let errorMessage = 'Email verification failed.';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    console.log('Setting error message:', errorMessage);
    
    // Cache failed verifications to avoid repeated API calls
    emailExistenceCache.set(email, false);
    
    setStepValidation((prev) => ({
      ...prev,
      isLoading: manageLoadingState ? false : prev.isLoading,
      errors: { ...prev.errors, email: errorMessage },
    }));
    
    // Show toast error but don't show "Processing request..." anymore
    if (manageLoadingState) {
      toast.error(errorMessage);
    }
    return false;
  } finally {
    // Always remove from ongoing verifications
    ongoingEmailExistenceVerifications.delete(email);
  }
};

// Function to debounce email validation
export const debounceEmailValidation = (
  email: string,
  setStepValidation: SetStepValidation,
  delay = 500
): void => {
  // Skip validation for empty or invalid emails
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return;
  }
  
  // Clear previous timeout
  if (emailValidationTimeout) {
    clearTimeout(emailValidationTimeout);
  }
  
  // Set new timeout
  emailValidationTimeout = setTimeout(() => {
    validateEmail(email, setStepValidation);
  }, delay);
};
