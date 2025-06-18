import api from './api';
import {
  Customer,
  CustomerSimple,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ValidateCustomerCodeRequest,
} from '../models/customer';

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    try {
      const response = await api.get('/Customer');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  getSimple: async (): Promise<CustomerSimple[]> => {
    try {
      const response = await api.get('/Customer/simple');
      return response.data;
    } catch (error) {
      console.error('Error fetching simple customers:', error);
      throw error;
    }
  },

  getByCode: async (code: string): Promise<Customer> => {
    try {
      const response = await api.get(`/Customer/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer with code ${code}:`, error);
      throw error;
    }
  },

  validateCode: async (code: string, excludeCode?: string): Promise<boolean> => {
    try {
      const response = await api.post('/Customer/validate-code', {
        code,
        excludeCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating customer code:', error);
      throw error;
    }
  },

  create: async (request: CreateCustomerRequest): Promise<Customer> => {
    try {
      const response = await api.post('/Customer', request);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  update: async (code: string, request: UpdateCustomerRequest): Promise<void> => {
    try {
      await api.put(`/Customer/${code}`, request);
    } catch (error) {
      console.error(`Error updating customer with code ${code}:`, error);
      throw error;
    }
  },

  delete: async (code: string): Promise<void> => {
    try {
      await api.delete(`/Customer/${code}`);
    } catch (error) {
      console.error(`Error deleting customer with code ${code}:`, error);
      throw error;
    }
  },
};

export default customerService; 