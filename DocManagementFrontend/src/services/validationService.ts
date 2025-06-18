import authService from './authService';
import { toast } from 'sonner';

const validationService = {
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    try {
      return await authService.validateUsername(username);
    } catch (error) {
      console.error('Error checking username:', error);
      toast.error('Failed to validate username');
      return false;
    }
  },

  checkEmailAvailability: async (email: string): Promise<boolean> => {
    try {
      return await authService.validateEmail(email);
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('Failed to validate email');
      return false;
    }
  },

  validateCredentials: async (username: string, email: string): Promise<{ 
    isValid: boolean;
    usernameError?: string;
    emailError?: string;
  }> => {
    try {
      const [usernameAvailable, emailAvailable] = await Promise.all([
        validationService.checkUsernameAvailability(username),
        validationService.checkEmailAvailability(email)
      ]);

      const result = {
        isValid: usernameAvailable && emailAvailable,
        usernameError: !usernameAvailable ? 'This username is already taken' : undefined,
        emailError: !emailAvailable ? 'This email is already registered' : undefined
      };

      return result;
    } catch (error) {
      console.error('Error validating credentials:', error);
      toast.error('Failed to validate credentials');
      return {
        isValid: false,
        usernameError: 'Failed to validate username',
        emailError: 'Failed to validate email'
      };
    }
  }
};

export default validationService; 