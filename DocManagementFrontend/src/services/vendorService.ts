import api from './api';
import {
  Vendor,
  VendorSimple,
  CreateVendorRequest,
  UpdateVendorRequest,
  ValidateVendorCodeRequest,
} from '../models/vendor';

export const vendorService = {
  getAll: async (): Promise<Vendor[]> => {
    try {
      const response = await api.get('/Vendor');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  getSimple: async (): Promise<VendorSimple[]> => {
    try {
      const response = await api.get('/Vendor/simple');
      return response.data;
    } catch (error) {
      console.error('Error fetching simple vendors:', error);
      throw error;
    }
  },

  getByCode: async (vendorCode: string): Promise<Vendor> => {
    try {
      const response = await api.get(`/Vendor/${vendorCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vendor with code ${vendorCode}:`, error);
      throw error;
    }
  },

  validateCode: async (vendorCode: string, excludeVendorCode?: string): Promise<boolean> => {
    try {
      const response = await api.post('/Vendor/validate-code', {
        vendorCode,
        excludeVendorCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating vendor code:', error);
      throw error;
    }
  },

  create: async (request: CreateVendorRequest): Promise<Vendor> => {
    try {
      const response = await api.post('/Vendor', request);
      return response.data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  },

  update: async (vendorCode: string, request: UpdateVendorRequest): Promise<void> => {
    try {
      await api.put(`/Vendor/${vendorCode}`, request);
    } catch (error) {
      console.error(`Error updating vendor with code ${vendorCode}:`, error);
      throw error;
    }
  },

  delete: async (vendorCode: string): Promise<void> => {
    try {
      await api.delete(`/Vendor/${vendorCode}`);
    } catch (error) {
      console.error(`Error deleting vendor with code ${vendorCode}:`, error);
      throw error;
    }
  },
};

export default vendorService; 