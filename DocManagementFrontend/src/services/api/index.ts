import api from './core';
import { setupInterceptors } from './interceptors';
import { checkApiConnection, getCachedConnectionStatus } from './connectionCheck';

// Set up interceptors
setupInterceptors();

// Export the api instance and utilities
export { checkApiConnection, getCachedConnectionStatus };
export default api;
