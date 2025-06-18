import { toast } from 'sonner';
import api from './core';
import { handleErrorResponse, shouldSkipAuthRedirect, shouldSkipErrorToast } from './errorHandlers';
import { tokenManager } from '../tokenManager';

// Track failed requests to avoid multiple login redirects
let hasRedirectedToLogin = false;

// Request interceptor for API calls
const setupRequestInterceptor = () => {
  api.interceptors.request.use(
    async (config) => {
      // Ensure we have a valid token before making the request
      const token = await tokenManager.ensureValidToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      });
      
      // Show loading toast for long operations
      if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
        const requestId = Date.now().toString();
        // @ts-ignore - Add a custom property to the config
        config.requestId = requestId;
        
        // For sensitive operations like login, don't show the toast
        if (!config.url?.includes('/Auth/login') && !config.url?.includes('/Auth/register')) {
          toast.loading('Processing request...', { id: requestId });
        }
      }
      
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
};

// Response interceptor for API calls
const setupResponseInterceptor = () => {
  api.interceptors.response.use(
    (response) => {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });

      // Dismiss loading toast if it exists
      // @ts-ignore - Access the custom property from the config
      if (response.config.requestId) {
        // @ts-ignore
        toast.dismiss(response.config.requestId);
      }
      
      return response;
    },
    async (error) => {
      // Dismiss loading toast if it exists
      // @ts-ignore - Access the custom property from the config
      if (error.config?.requestId) {
        // @ts-ignore
        toast.dismiss(error.config.requestId);
      }
      
      // Network errors (no connection to server)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.error('Network error detected:', error);
        
        // Don't show error toast for login/register as they handle errors themselves
        if (!error.config?.url?.includes('/Auth/login') && !error.config?.url?.includes('/Auth/register')) {
          // Static paths that should show connection errors (important actions)
          const criticalPaths = ['/documents', '/document-types'];
          const isCriticalPath = criticalPaths.some(path => window.location.pathname.includes(path));
          
          // Only show error once per session unless it's a critical path
          const lastErrorTime = sessionStorage.getItem('lastNetworkErrorTime');
          const now = Date.now();
          
          if (!lastErrorTime || (now - parseInt(lastErrorTime)) > 60000 || isCriticalPath) {
            sessionStorage.setItem('lastNetworkErrorTime', now.toString());
            toast.error('Network error. Please check your connection and try again.', {
              description: 'Unable to connect to the server'
            });
          }
        }
        
        return Promise.reject(error);
      }

      // Handle SSL errors
      if (error.message?.includes('SSL') || error.code === 'ERR_SSL_PROTOCOL_ERROR') {
        console.error('SSL error detected:', error);
        
        if (!error.config?.url?.includes('/Auth/login') && !error.config?.url?.includes('/Auth/register')) {
          toast.error('SSL connection error. Contact your administrator to configure correct API settings.');
        }
        
        return Promise.reject(error);
      }
      
      console.error('API Response Error:', error.response || error);
      
      // Skip toast for endpoints that handle their own errors
      const skipToast = shouldSkipErrorToast(error.config?.url || '');
                      
      const originalRequest = error.config;
      
      // Handle 401 Unauthorized errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Check if we should skip auth redirect for certain endpoints
        const shouldRedirect = !shouldSkipAuthRedirect(originalRequest?.url || '');
        
        if (shouldRedirect && !hasRedirectedToLogin) {
          console.log('401 error detected, attempting token refresh for:', originalRequest.url);
          
          // Try to refresh the token first
          const newToken = await tokenManager.refreshToken();
          
          if (newToken) {
            console.log('Token refreshed successfully, retrying request');
            // Update the original request with new token and retry
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            // Refresh failed, redirect to login
            console.log('Token refresh failed, redirecting to login');
            hasRedirectedToLogin = true;
            
            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Reset the flag after a delay to handle subsequent requests
            setTimeout(() => {
              hasRedirectedToLogin = false;
            }, 2000);
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        } else {
          console.log('Skipping token refresh for endpoint:', originalRequest.url);
        }
      }
      
      // Handle 403 Forbidden errors (e.g., accessing admin endpoints without permission)
      if (error.response?.status === 403) {
        toast.error('Permission Denied', {
          description: 'You do not have permission to perform this action.'
        });
        
        // If accessing admin endpoint, redirect to dashboard
        if (originalRequest?.url?.includes('/Admin/')) {
          window.location.href = '/dashboard';
        }
      }
      
      return handleErrorResponse(error, skipToast);
    }
  );
};

export const setupInterceptors = () => {
  setupRequestInterceptor();
  setupResponseInterceptor();
};
