import api from './api';

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterCredentials {
  Email: string;
  Username: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  UserType: string;
  City: string;
  Address: string;
  PhoneNumber: string;
  Country: string;
  WebSite: string;
  Identity: string;
  ResponsibilityCentreId?: number | null;
  NewResponsibilityCentre?: {
    code: string;
    descr: string;
  } | null;
  // Keep adminSecretKey for header processing
  adminSecretKey?: string;
}

export interface UserInfo {
  userId: string; // Changed from 'id' to 'userId' to match the API response
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  profilePicture?: string;
  role?: string;
  address?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  isActive?: boolean;
  isOnline?: boolean;
  userType?: 'personal' | 'company';
  // Personal user fields
  cin?: string;
  personalAddress?: string;
  personalPhone?: string;
  // Company fields
  companyName?: string;
  companyRC?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  // Responsibility centre information - matching API response property name
  responsibilityCenter?: {
    id: number;
    code: string;
    descr: string;
    isActive?: boolean;
  } | null;
  // Keep the old property name for backward compatibility
  responsibilityCentre?: {
    id: number;
    code: string;
    descr: string;
    isActive?: boolean;
  } | null;
}

export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  country?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface LogoutRequest {
  userId: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

// Interface for email validation requests
interface EmailValidationRequest {
  email: string;
}

// Interface for username validation requests
interface UsernameValidationRequest {
  username: string;
}

// Interface for email verification requests
interface EmailVerificationRequest {
  email: string;
  verificationCode: string;
}

// Interface for forgot password request
interface ForgotPasswordRequest {
  email: string;
}

// Interface for update password request
interface UpdatePasswordRequest {
  email: string;
  newPassword: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/Auth/login', credentials);
      console.log('Auth response data:', response.data);
      
      // If API returns accessToken directly
      if (response.data.accessToken) {
        // Get user info with the token
        localStorage.setItem('token', response.data.accessToken);
        
        // Store refresh token if available
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Fetch user info immediately
        try {
          const userInfoResponse = await api.get('/Account/user-info');
          console.log('User info fetched:', userInfoResponse.data);
          
          // Make sure we have a user ID
          if (!userInfoResponse.data.userId) {
            console.error('User info is missing userId:', userInfoResponse.data);
          }
          
          return {
            token: response.data.accessToken,
            user: userInfoResponse.data
          };
        } catch (error) {
          console.error('Error fetching user info:', error);
          throw error;
        }
      } 
      // If API already returns both token and user
      else if (response.data.token && response.data.user) {
        // Store refresh token if available
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Ensure we have a user ID
        if (!response.data.user.userId) {
          console.error('User data is missing userId:', response.data.user);
        }
        
        return response.data;
      }
      
      throw new Error('Invalid response format from authentication server');
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials): Promise<any> => {
    // If admin secret key is provided, add it to headers
    const headers = credentials.adminSecretKey 
      ? { 'AdminSecret': credentials.adminSecretKey } 
      : undefined;
    
    // Remove adminSecretKey from the request body as it should be in headers
    const { adminSecretKey, ...requestBody } = credentials;
    
    const response = await api.post('/Auth/register', requestBody, { headers });
    
    return response.data;
  },

  getUserInfo: async (): Promise<UserInfo> => {
    try {
      const response = await api.get('/Account/user-info');
      console.log('User info response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  },

  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token available');
        return null;
      }

      // Send refresh token in the request body
      const response = await api.post('/Auth/refresh-token', {
        refreshToken: refreshToken
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        
        // Update refresh token if a new one is provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        console.log('Token refreshed successfully');
        return response.data.accessToken;
      }
      
      return null;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // If refresh fails, clear all tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  },

  logout: async (userId: string): Promise<void> => {
    try {
      if (!userId) {
        console.error('Cannot call logout API: userId is not provided');
        return;
      }
      
      console.log('Calling logout API with userId:', userId);
      
      // Create a LogoutRequest object to match what the backend expects
      const request: LogoutRequest = { userId };
      
      // Add more debug information
      console.log('Sending logout request:', JSON.stringify(request));
      
      // Send the request as JSON in the body
      const response = await api.post('/Auth/logout', request);
      console.log('Logout API response:', response.data);
    } catch (error: any) {
      console.error('Error calling logout API:', error);
      // Show more details about the error
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      // Do not throw the error as we want to continue with the local logout
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  validateUsername: async (username: string): Promise<boolean> => {
    try {
      console.log('Validating username:', username);
      const request: UsernameValidationRequest = { username };
      const response = await api.post('/Auth/valide-username', request);
      
      console.log('Username validation response:', response.data);
      
      // Backend returns string "True" or "False"
      if (typeof response.data === 'string') {
        return response.data === "True";
      }
      
      return false;
    } catch (error) {
      console.error('Username validation error:', error);
      throw error;
    }
  },

  validateEmail: async (email: string): Promise<boolean> => {
    try {
      console.log('Validating email:', email);
      const request: EmailValidationRequest = { email };
      const response = await api.post('/Auth/valide-email', request);
      
      console.log('Email validation response:', response.data);
      
      // Backend returns string "True" or "False"
      if (typeof response.data === 'string') {
        return response.data === "True";
      }
      
      return false;
    } catch (error) {
      console.error('Email validation error:', error);
      throw error;
    }
  },

  verifyEmail: async (email: string, code: string): Promise<boolean> => {
    try {
      console.log('Verifying email:', email, 'with code:', code);
      const request: EmailVerificationRequest = { 
        email, 
        verificationCode: code 
      };
      
      const response = await api.post('/Auth/verify-email', request);
      console.log('Email verification response:', response.data);
      
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      console.log('Requesting password reset for email:', email);
      const request: ForgotPasswordRequest = { email };
      const response = await api.post('/Account/forgot-password', request);
      
      console.log('Password reset response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      if (error.response?.status === 401 && error.response?.data === "Email Not Verified!") {
        // If email is not verified, resend the verification code without redirecting
        try {
          await authService.resendVerificationCode(email);
          throw new Error("Email not verified. A new verification code has been sent.");
        } catch (resendError) {
          console.error('Error resending verification code:', resendError);
          throw new Error("Email not verified. Failed to send verification code.");
        }
      }
      throw error;
    }
  },

  resendVerificationCode: async (email: string): Promise<string> => {
    try {
      console.log('Resending verification code for email:', email);
      const request: ForgotPasswordRequest = { email };
      const response = await api.post('/Account/resend-code', request);
      
      console.log('Resend verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },
  
  updatePassword: async (email: string, newPassword: string): Promise<string> => {
    try {
      console.log('Updating password for email:', email);
      const request: UpdatePasswordRequest = { 
        email, 
        newPassword 
      };
      const response = await api.put('/Account/update-password', request);
      
      console.log('Update password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },
  
  updateProfile: async (data: UpdateProfileRequest): Promise<string> => {
    try {
      const response = await api.put('/Account/update-profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  uploadProfileImage: async (file: File): Promise<{ filePath: string, message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // For file uploads we need to set the content type to multipart/form-data
      // but we don't set it explicitly as the browser will set the correct boundary
      const response = await api.post('/Account/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw error;
    }
  },

  getProfileImage: async (userId: string): Promise<{ ProfilePicture: string }> => {
    try {
      const response = await api.get(`/Account/profile-image/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get profile image:', error);
      throw error;
    }
  },

  updateEmail: async (email: string): Promise<string> => {
    try {
      const request: UpdateEmailRequest = { email };
      const response = await api.put('/Account/update-email', request);
      return response.data;
    } catch (error) {
      console.error('Failed to update email:', error);
      throw error;
    }
  },

  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); 
    localStorage.removeItem('user');
  }
};

export default authService;
