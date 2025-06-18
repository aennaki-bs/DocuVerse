
import authService from '@/services/authService';
import { toast } from 'sonner';
import { SetStepValidation } from '../types';

// Cache for username validation results to reduce API calls
const usernameValidationCache = new Map<string, boolean>();
// Debounce timeout reference
let usernameValidationTimeout: NodeJS.Timeout | null = null;

export const validateUsername = async (
  username: string, 
  setStepValidation: SetStepValidation
): Promise<boolean> => {
  // Skip validation for empty usernames
  if (!username || username.trim().length < 4) {
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
  
  setStepValidation((prev) => ({ ...prev, isLoading: true, errors: { ...prev.errors, username: '' } }));
  try {
    const isValid = await authService.validateUsername(username);
    
    // Cache the result
    usernameValidationCache.set(username, isValid);
    
    if (!isValid) {
      setStepValidation((prev) => ({
        ...prev,
        isLoading: false,
        errors: { ...prev.errors, username: 'Username already taken.' },
      }));
      return false;
    }
    
    setStepValidation((prev) => ({ 
      ...prev, 
      isLoading: false,
      errors: { ...prev.errors, username: '' }
    }));
    return true;
  } catch (error: any) {
    console.error('Username validation error:', error);
    const errorMessage = error.response?.data?.message || 'Username validation failed.';
    setStepValidation((prev) => ({
      ...prev,
      isLoading: false,
      errors: { ...prev.errors, username: errorMessage },
    }));
    return false;
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

export const validateEmail = async (
  email: string,
  setStepValidation: SetStepValidation
): Promise<boolean> => {
  // Skip validation for empty emails or invalid format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
  
  setStepValidation((prev) => ({ ...prev, isLoading: true, errors: { ...prev.errors, email: '' } }));
  try {
    const isValid = await authService.validateEmail(email);
    
    // Cache the result
    emailValidationCache.set(email, isValid);
    
    if (!isValid) {
      setStepValidation((prev) => ({
        ...prev,
        isLoading: false,
        errors: { ...prev.errors, email: 'Email already registered.' },
      }));
      toast.error('Email validation failed. This email may already be registered.');
      return false;
    }
    
    setStepValidation((prev) => ({ 
      ...prev, 
      isLoading: false,
      errors: { ...prev.errors, email: '' }
    }));
    return true;
  } catch (error: any) {
    console.error('Email validation error:', error);
    const errorMessage = error.response?.data?.message || 'Email validation failed.';
    setStepValidation((prev) => ({
      ...prev,
      isLoading: false,
      errors: { ...prev.errors, email: errorMessage },
    }));
    toast.error(errorMessage);
    return false;
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
