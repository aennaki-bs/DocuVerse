import api from '../api';
import { Ligne, CreateLigneRequest, UpdateLigneRequest } from '../../models/document';

const ligneService = {
  getAllLignes: async (): Promise<Ligne[]> => {
    try {
      const response = await api.get('/Lignes');
      return response.data;
    } catch (error) {
      console.error('Error fetching lignes:', error);
      throw error;
    }
  },

  getLigneById: async (id: number): Promise<Ligne> => {
    try {
      const response = await api.get(`/Lignes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ligne with ID ${id}:`, error);
      throw error;
    }
  },

  getLignesByDocumentId: async (documentId: number): Promise<Ligne[]> => {
    try {
      const response = await api.get(`/Lignes/by-document/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lignes for document ${documentId}:`, error);
      throw error;
    }
  },

  createLigne: async (ligne: CreateLigneRequest): Promise<Ligne> => {
    try {
      const response = await api.post('/Lignes', ligne);
      return response.data;
    } catch (error) {
      console.error('Error creating ligne:', error);
      throw error;
    }
  },

  updateLigne: async (id: number, ligne: UpdateLigneRequest): Promise<void> => {
    try {
      await api.put(`/Lignes/${id}`, ligne);
    } catch (error) {
      console.error(`Error updating ligne with ID ${id}:`, error);
      throw error;
    }
  },

  deleteLigne: async (id: number): Promise<void> => {
    try {
      await api.delete(`/Lignes/${id}`);
    } catch (error) {
      console.error(`Error deleting ligne with ID ${id}:`, error);
      throw error;
    }
  },
};

export default ligneService;
