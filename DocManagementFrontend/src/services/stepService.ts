import api from './api/core';
import { toast } from 'sonner';
import { Step, CreateStepDto, UpdateStepDto } from '@/models/step';

const stepService = {
  getAllSteps: async (): Promise<Step[]> => {
    try {
      const response = await api.get('/Circuit/steps');
      return response.data;
    } catch (error) {
      console.error('Error fetching steps:', error);
      toast.error('Failed to fetch steps');
      return [];
    }
  },

  getStepById: async (id: number): Promise<Step | null> => {
    try {
      const response = await api.get(`/Circuit/steps/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching step ${id}:`, error);
      toast.error('Failed to fetch step details');
      return null;
    }
  },

  getStepsByCircuitId: async (circuitId: number): Promise<Step[]> => {
    try {
      const response = await api.get(`/Circuit/${circuitId}`);
      return response.data.steps || [];
    } catch (error) {
      console.error(`Error fetching steps for circuit ${circuitId}:`, error);
      toast.error('Failed to fetch circuit steps');
      return [];
    }
  },

  createStep: async (step: CreateStepDto): Promise<Step | null> => {
    try {
      // First, validate that the step doesn't already exist
      if (step.currentStatusId && step.nextStatusId) {
        try {
          // Double-check if a step with these statuses already exists
          console.log("Service layer validation:", {
            circuitId: step.circuitId,
            currentStatusId: step.currentStatusId,
            nextStatusId: step.nextStatusId,
          });
          
          const checkResponse = await api.get(`/Circuit/check-step-exists`, {
            params: {
              circuitId: step.circuitId,
              currentStatusId: step.currentStatusId,
              nextStatusId: step.nextStatusId,
            },
          });
          
          console.log("Service validation response:", checkResponse.data);
          
          // Handle different possible response formats
          const exists = 
            // Check for exists property
            (checkResponse.data && checkResponse.data.exists === true) ||
            // Check for available property (true means it exists and is not available)
            (checkResponse.data && checkResponse.data.available === true) ||
            // Check for simple boolean response
            (checkResponse.data === true);
          
          if (exists) {
            console.log("Duplicate step detected in service layer!");
            // A step with these transitions already exists - prevent creation
            toast.error(
              "Cannot create step: A step with these status transitions already exists.",
              {
                description: "Please go back and choose different status transitions.",
                duration: 5000,
              }
            );
            return null;
          }
        } catch (checkError) {
          console.error("Error checking if step exists:", checkError);
          // Continue anyway to not block the user if check fails
        }
      }
      
      // Proceed with step creation if validation passed
      const response = await api.post(`/Circuit/${step.circuitId}/steps`, step);
      toast.success('Step created successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error creating step:', error);
      
      // Check if the error is related to duplicate steps
      if (error?.response?.status === 400 && 
          error?.response?.data?.message?.toLowerCase().includes('duplicate')) {
        toast.error("Cannot create duplicate step", {
          description: "A step with these status transitions already exists. Please choose different statuses.",
          duration: 5000,
        });
      } else {
        toast.error('Failed to create step');
      }
      
      return null;
    }
  },

  updateStep: async (id: number, step: UpdateStepDto): Promise<boolean> => {
    try {
      await api.put(`/Circuit/steps/${id}`, step);
      toast.success('Step updated successfully');
      return true;
    } catch (error) {
      console.error(`Error updating step ${id}:`, error);
      toast.error('Failed to update step');
      return false;
    }
  },

  deleteStep: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/Circuit/steps/${id}`);
      toast.success('Step deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting step ${id}:`, error);
      toast.error('Failed to delete step');
      return false;
    }
  },

  deleteMultipleSteps: async (ids: number[]): Promise<boolean> => {
    try {
      // Sequentially delete steps as there might not be a bulk delete endpoint
      for (const id of ids) {
        await api.delete(`/Circuit/steps/${id}`);
      }
      toast.success(`Successfully deleted ${ids.length} steps`);
      return true;
    } catch (error) {
      console.error('Error deleting multiple steps:', error);
      toast.error('Failed to delete some or all steps');
      return false;
    }
  },

  // Add a dedicated function to check if a step with specific status transitions exists
  checkStepExists: async (
    circuitId: number,
    currentStatusId: number,
    nextStatusId: number
  ): Promise<boolean> => {
    try {
      console.log("Checking step exists with dedicated function:", {
        circuitId,
        currentStatusId,
        nextStatusId,
      });
      
      const response = await api.get('/Circuit/check-step-exists', {
        params: {
          circuitId,
          currentStatusId,
          nextStatusId
        }
      });
      
      console.log("Step exists check response:", response.data);
      
      // Handle different possible response formats
      const exists = 
        // Check for exists property
        (response.data && response.data.exists === true) ||
        // Check for available property (true means it exists and is not available)
        (response.data && response.data.available === true) ||
        // Check for simple boolean response
        (response.data === true);
      
      return exists;
    } catch (error) {
      console.error('Error checking if step exists:', error);
      // Default to false on error to not block the user
      return false;
    }
  },
};

export default stepService;
