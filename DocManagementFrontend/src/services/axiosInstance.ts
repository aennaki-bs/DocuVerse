// DEPRECATED: This file is deprecated in favor of the centralized API instance
// Use './api' instead to avoid conflicts and ensure proper token refresh handling

import { toast } from 'sonner';

// Show deprecation warning for developers
console.warn('DEPRECATED: axiosInstance.ts is deprecated. Use ./api instead for better token refresh handling.');

// Re-export the main API instance to maintain backward compatibility
export { default as axiosInstance } from './api'; 