import authService from '@/services/authService';
import { toast } from 'sonner';
import { FormData, SetStepValidation } from '../types';

export const prepareUserData = (formData: FormData) => {
  // Create the base user data with correct field names to match backend RegisterRequest exactly
  const userData = {
    Email: formData.email || '',
    Username: formData.username || '',
    PasswordHash: formData.password || '',
    FirstName: formData.firstName || '',
    LastName: formData.lastName || '',
    UserType: formData.userType || 'personal',
    // Include admin secret key for header processing
    adminSecretKey: formData.requestAdminAccess ? (formData.adminSecretKey || '') : undefined,
  };
  
  // Add user type specific data with exact backend field names
  if (formData.userType === 'personal') {
    return {
      ...userData,
      // Personal user specific fields - using exact backend field names
      Identity: formData.cin || '', // Map CIN to Identity field
      Address: formData.personalAddress || formData.address || '', // Handle both personal and generic address fields
      City: formData.city || '', // Backend expects 'City' with capital C
      Country: formData.country || '', // Backend expects 'Country' with capital C
      PhoneNumber: formData.personalPhone || formData.phoneNumber || '', // Handle both personal and generic phone fields
      WebSite: '', // Personal users don't have website - backend expects 'WebSite'
    };
  } else {
    // Company account - map company fields correctly
    return {
      ...userData,
      // For company accounts, map company name to firstName as per backend logic
      FirstName: formData.companyName || '',
      LastName: formData.lastName || '', // Keep lastName for company contact person
      Identity: formData.companyRC || '', // Map company RC to Identity field - backend expects 'Identity'
      Address: formData.companyAddress || formData.address || '', // Handle both company and generic address fields
      City: formData.companyCity || formData.city || '', // Handle both company and generic city fields
      Country: formData.companyCountry || formData.country || '', // Handle both company and generic country fields
      PhoneNumber: formData.companyPhone || formData.phoneNumber || '', // Handle both company and generic phone fields
      WebSite: formData.companyWebsite || formData.website || '', // Handle both company and generic website fields
      // Override email if company has specific email
      Email: formData.companyEmail || formData.email || '',
    };
  }
};

export const registerUser = async (
  formData: FormData,
  setStepValidation: SetStepValidation,
  navigateFunction: (path: string, state?: any) => void
): Promise<boolean> => {
  setStepValidation((prev) => ({ ...prev, isLoading: true, errors: {} }));
  
  try {
    const userData = prepareUserData(formData);
    console.log("Sending registration data for userType:", formData.userType);
    console.log("Mapped registration data:", userData);
    
    const response = await authService.register(userData);
    console.log("Registration response:", response);
    
    setStepValidation((prev) => ({ ...prev, isLoading: false }));
    
    toast.success('Registration successful! Please check your email for verification.');
    
    // Navigate to success page instead of verification page directly
    navigateFunction('/registration-success', { 
      state: { email: formData.email }
    });
    
    return true;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.response.data && typeof error.response.data.error === 'string') {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setStepValidation((prev) => ({
      ...prev,
      isLoading: false,
      errors: { registration: errorMessage },
    }));
    
    toast.error(errorMessage);
    
    return false;
  }
};

export const verifyEmail = async (
  email: string,
  code: string,
  setStepValidation: SetStepValidation,
  navigateFunction: (path: string, state?: any) => void
): Promise<boolean> => {
  setStepValidation((prev) => ({ ...prev, isLoading: true, errors: {} }));
  try {
    const isVerified = await authService.verifyEmail(email, code);
    
    if (!isVerified) {
      setStepValidation((prev) => ({
        ...prev,
        isLoading: false,
        errors: { verification: 'Email verification failed. The code may be invalid or expired.' },
      }));
      toast.error('Email verification failed. The code may be invalid or expired.');
      return false;
    }
    
    setStepValidation((prev) => ({ ...prev, isLoading: false }));
    toast.success('Email verified successfully!');
    
    // Redirect to welcome page after successful verification
    navigateFunction('/welcome', { 
      state: { 
        verified: true,
        email: email
      }
    });
    
    return true;
  } catch (error: any) {
    console.error('Email verification error:', error);
    const errorMessage = error.response?.data?.message || 'Email verification failed.';
    setStepValidation((prev) => ({
      ...prev,
      isLoading: false,
      errors: { verification: errorMessage },
    }));
    toast.error(errorMessage);
    return false;
  }
};
