import { Action, CreateActionDto, UpdateActionDto, AssignActionToStepDto } from '@/models/action';
import { axiosInstance } from './axiosInstance';

const BASE_URL = '/api/Action';

export const actionService = {
  getActions: async (): Promise<Action[]> => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getAction: async (id: number): Promise<Action> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  createAction: async (data: CreateActionDto): Promise<Action> => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  updateAction: async (id: number, data: UpdateActionDto): Promise<Action> => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteAction: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  toggleActionStatus: async (id: number): Promise<Action> => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/toggle-status`);
    return response.data;
  },

  assignToStep: async (data: AssignActionToStepDto): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/assign-to-step`, data);
  },

  getStepActions: async (stepId: number): Promise<Action[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/by-step/${stepId}`);
    return response.data;
  }
}; 