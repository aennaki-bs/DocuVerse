import api from './api/index';

export interface UserDto {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  profilePicture?: string;
  createdAt: string;
}

export interface UserLogDto {
  username: string;
  role?: string;
}

export interface LogHistoryDto {
  id: number;
  actionType: number;
  timestamp: string;
  description: string;
  user: UserLogDto;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roleName: string;
}

export interface UpdateUserRequest {
  username?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  isEmailConfirmed?: boolean;
  roleName?: string;
}

export interface UpdateUserEmailRequest {
  email: string;
}

export interface Role {
  id: number;
  name: string;
}

const adminService = {
  // Get all users
  getAllUsers: async (): Promise<UserDto[]> => {
    try {
      const response = await api.get('/Admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: number): Promise<UserDto> => {
    try {
      const response = await api.get(`/Admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<UserDto> => {
    try {
      // Validate required fields
      if (!userData.email || !userData.username || !userData.passwordHash || 
          !userData.firstName || !userData.lastName || !userData.roleName) {
        throw new Error('Missing required user data fields');
      }
      
      const response = await api.post('/Admin/users', userData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      // More specific error handling based on response
      if (error.response?.status === 409) {
        throw new Error('Username or email already exists');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data || 'Invalid user data');
      }
      throw error;
    }
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<string> => {
    try {
      const response = await api.put(`/Admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  // Update user email
  updateUserEmail: async (id: number, email: string): Promise<string> => {
    try {
      const response = await api.put(`/Admin/users/email/${id}`, { email });
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id} email:`, error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: number): Promise<string> => {
    try {
      const response = await api.delete(`/Admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  // Delete multiple users
  deleteMultipleUsers: async (userIds: number[]): Promise<string> => {
    try {
      const response = await api.delete('/Admin/delete-users', { 
        data: userIds 
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      throw error;
    }
  },

  // Get user log history
  getUserLogs: async (userId: number): Promise<LogHistoryDto[]> => {
    try {
      const response = await api.get(`/Admin/logs/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for user ${userId}:`, error);
      throw error;
    }
  },

  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const response = await api.get('/Admin/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      // Validate email format before making the API call
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      const response = await api.post(`/Auth/valide-email`, { email: email.trim() });
      
      // Handle the response properly - API returns "True" or "False" as strings
      if (response.data === "False") {
        // Email exists (taken) - return true to indicate email exists
        return true;
      } else if (response.data === "True") {
        // Email is available - return false to indicate email doesn't exist
        return false;
      }
      
      // If response format is unexpected, throw an error
      throw new Error('Unexpected response format from server');
      
    } catch (error: any) {
      console.error("Error checking email existence:", error);
      
      // Handle different types of errors
      if (error.message && (error.message.includes('Email is required') || error.message.includes('valid email'))) {
        // Re-throw validation errors
        throw error;
      }
      
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data;
        
        switch (status) {
          case 400:
            throw new Error(message || 'Invalid email format');
          case 401:
            throw new Error('Authentication required to check email');
          case 403:
            throw new Error('You do not have permission to check email availability');
          case 404:
            throw new Error('Email validation service not available');
          case 500:
            throw new Error('Server error occurred while checking email. Please try again.');
          default:
            throw new Error(`Server error (${status}). Please try again.`);
        }
      } else if (error.request) {
        // Network error - no response received
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        // Other error (validation, unexpected format, etc.)
        throw new Error(error.message || 'An unexpected error occurred while checking email');
      }
    }
  }
};

export default adminService;
