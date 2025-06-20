import api from './api';
import {
  LignesElementType,
  LignesElementTypeSimple,
  CreateLignesElementTypeRequest,
  UpdateLignesElementTypeRequest,
  Item,
  ItemSimple,
  CreateItemRequest,
  UpdateItemRequest,
  UniteCode,
  UniteCodeSimple,
  CreateUniteCodeRequest,
  UpdateUniteCodeRequest,
  GeneralAccounts,
  GeneralAccountsSimple,
  CreateGeneralAccountsRequest,
  UpdateGeneralAccountsRequest,
  ItemUnitOfMeasure,
} from '../models/lineElements';

// LignesElementType Service
export const lignesElementTypeService = {
  getAll: async (): Promise<LignesElementType[]> => {
    try {
      const response = await api.get('/LignesElementType');
      return response.data;
    } catch (error) {
      console.error('Error fetching element types:', error);
      throw error;
    }
  },

  getSimple: async (): Promise<LignesElementTypeSimple[]> => {
    try {
      const response = await api.get('/LignesElementType/simple');
      return response.data;
    } catch (error) {
      console.error('Error fetching simple element types:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<LignesElementType> => {
    try {
      const response = await api.get(`/LignesElementType/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching element type with ID ${id}:`, error);
      throw error;
    }
  },

  create: async (request: CreateLignesElementTypeRequest): Promise<LignesElementType> => {
    try {
      const response = await api.post('/LignesElementType', request);
      return response.data;
    } catch (error) {
      console.error('Error creating element type:', error);
      throw error;
    }
  },

  update: async (id: number, request: UpdateLignesElementTypeRequest): Promise<void> => {
    try {
      await api.put(`/LignesElementType/${id}`, request);
    } catch (error) {
      console.error(`Error updating element type with ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/LignesElementType/${id}`);
    } catch (error) {
      console.error(`Error deleting element type with ID ${id}:`, error);
      throw error;
    }
  },

  isInUse: async (id: number): Promise<boolean> => {
    try {
      const response = await api.get(`/LignesElementType/${id}/in-use`);
      return response.data;
    } catch (error) {
      console.error(`Error checking if element type with ID ${id} is in use:`, error);
      throw error;
    }
  },
};

// Item Service
export const itemService = {
  getAll: async (): Promise<Item[]> => {
    try {
      const response = await api.get('/Item');
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  getSimple: async (): Promise<ItemSimple[]> => {
    try {
      const response = await api.get('/Item/simple');
      return response.data;
    } catch (error) {
      console.error('Error fetching simple items:', error);
      throw error;
    }
  },

  getByCode: async (code: string): Promise<Item> => {
    try {
      const response = await api.get(`/Item/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching item with code ${code}:`, error);
      throw error;
    }
  },

  validateCode: async (code: string): Promise<boolean> => {
    try {
      const response = await api.post('/Item/validate-code', { code });
      return response.data;
    } catch (error) {
      console.error('Error validating item code:', error);
      throw error;
    }
  },

  create: async (request: CreateItemRequest): Promise<Item> => {
    try {
      const response = await api.post('/Item', request);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  update: async (code: string, request: UpdateItemRequest): Promise<void> => {
    try {
      await api.put(`/Item/${code}`, request);
    } catch (error) {
      console.error(`Error updating item with code ${code}:`, error);
      throw error;
    }
  },

  delete: async (code: string): Promise<void> => {
    try {
      await api.delete(`/Item/${code}`);
    } catch (error) {
      console.error(`Error deleting item with code ${code}:`, error);
      throw error;
    }
  },

  getItemUnits: async (itemCode: string): Promise<ItemUnitOfMeasure[]> => {
    try {
      const response = await api.get(`/Item/${itemCode}/units`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching units for item ${itemCode}:`, error);
      throw error;
    }
  },
};

// UniteCode Service
export const uniteCodeService = {
  getAll: async (): Promise<UniteCode[]> => {
    try {
      const response = await api.get('/UniteCode');
      return response.data;
    } catch (error) {
      console.error('Error fetching unite codes:', error);
      throw error;
    }
  },

  getSimple: async (): Promise<UniteCodeSimple[]> => {
    try {
      const response = await api.get('/UniteCode/simple');
      return response.data;
    } catch (error) {
      console.error('Error fetching simple unite codes:', error);
      throw error;
    }
  },

  getByCode: async (code: string): Promise<UniteCode> => {
    try {
      const response = await api.get(`/UniteCode/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching unite code with code ${code}:`, error);
      throw error;
    }
  },

  validateCode: async (code: string, excludeCode?: string): Promise<boolean> => {
    try {
      const response = await api.post('/UniteCode/validate-code', { 
        code,
        excludeCode 
      });
      return response.data;
    } catch (error) {
      console.error('Error validating unite code:', error);
      throw error;
    }
  },

  create: async (request: CreateUniteCodeRequest): Promise<UniteCode> => {
    try {
      const response = await api.post('/UniteCode', request);
      return response.data;
    } catch (error) {
      console.error('Error creating unite code:', error);
      throw error;
    }
  },

  update: async (code: string, request: UpdateUniteCodeRequest): Promise<void> => {
    try {
      await api.put(`/UniteCode/${code}`, request);
    } catch (error) {
      console.error(`Error updating unite code with code ${code}:`, error);
      throw error;
    }
  },

  delete: async (code: string): Promise<void> => {
    try {
      await api.delete(`/UniteCode/${code}`);
    } catch (error) {
      console.error(`Error deleting unite code with code ${code}:`, error);
      throw error;
    }
  },
};

// GeneralAccounts Service
export const generalAccountsService = {
  getAll: async (): Promise<GeneralAccounts[]> => {
    try {
      const response = await api.get('/GeneralAccounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching general accounts:', error);
      throw error;
    }
  },

  getSimple: async (): Promise<GeneralAccountsSimple[]> => {
    try {
      const response = await api.get('/GeneralAccounts/simple');
      return response.data;
    } catch (error) {
      console.error('Error fetching simple general accounts:', error);
      throw error;
    }
  },

  getByCode: async (code: string): Promise<GeneralAccounts> => {
    try {
      const response = await api.get(`/GeneralAccounts/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching general account with code ${code}:`, error);
      throw error;
    }
  },

  validateCode: async (code: string): Promise<boolean> => {
    try {
      const response = await api.post('/GeneralAccounts/validate-code', { code });
      return response.data;
    } catch (error) {
      console.error('Error validating general account code:', error);
      throw error;
    }
  },

  create: async (request: CreateGeneralAccountsRequest): Promise<GeneralAccounts> => {
    try {
      const response = await api.post('/GeneralAccounts', request);
      return response.data;
    } catch (error) {
      console.error('Error creating general account:', error);
      throw error;
    }
  },

  update: async (code: string, request: UpdateGeneralAccountsRequest): Promise<void> => {
    try {
      await api.put(`/GeneralAccounts/${code}`, request);
    } catch (error) {
      console.error(`Error updating general account with code ${code}:`, error);
      throw error;
    }
  },

  delete: async (code: string): Promise<void> => {
    try {
      await api.delete(`/GeneralAccounts/${code}`);
    } catch (error) {
      console.error(`Error deleting general account with code ${code}:`, error);
      throw error;
    }
  },
};

// Combined export for convenience
const lineElementsService = {
  elementTypes: lignesElementTypeService,
  items: itemService,
  uniteCodes: uniteCodeService,
  generalAccounts: generalAccountsService,
};

export default lineElementsService; 