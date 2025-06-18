
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';

interface CircuitFormData {
  // Basic circuit info
  title: string;
  descriptif: string;
  isActive: boolean;
  hasOrderedFlow: boolean;
  
  // Circuit steps
  steps: CircuitStepData[];
}

interface CircuitStepData {
  title: string;
  descriptif: string;
  orderIndex: number;
}

interface CircuitFormContextType {
  currentStep: number;
  formData: CircuitFormData;
  setCircuitData: (data: Partial<CircuitFormData>) => void;
  addStep: (step: CircuitStepData) => void;
  updateStep: (index: number, step: Partial<CircuitStepData>) => void;
  removeStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  isSubmitting: boolean;
  submitForm: () => Promise<boolean>;
}

const initialFormData: CircuitFormData = {
  title: '',
  descriptif: '',
  isActive: true,
  hasOrderedFlow: true,
  steps: []
};

const CircuitFormContext = createContext<CircuitFormContextType>({
  currentStep: 1,
  formData: initialFormData,
  setCircuitData: () => {},
  addStep: () => {},
  updateStep: () => {},
  removeStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
  resetForm: () => {},
  isSubmitting: false,
  submitForm: async () => false,
});

export const useCircuitForm = () => useContext(CircuitFormContext);

export const CircuitFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CircuitFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setCircuitData = (data: Partial<CircuitFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const addStep = (step: CircuitStepData) => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, step],
    }));
  };

  const updateStep = (index: number, step: Partial<CircuitStepData>) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, ...step } : s)),
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  const submitForm = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Create the circuit first
      const createdCircuit = await circuitService.createCircuit({
        title: formData.title,
        descriptif: formData.descriptif,
        isActive: formData.isActive,
        hasOrderedFlow: formData.hasOrderedFlow,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Add steps if there are any
      if (formData.steps.length > 0) {
        const stepPromises = formData.steps.map(step => 
          circuitService.createCircuitDetail({
            circuitId: createdCircuit.id,
            title: step.title,
            descriptif: step.descriptif,
            orderIndex: step.orderIndex,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );
        
        await Promise.all(stepPromises);
        toast.success('Circuit and steps created successfully');
      } else {
        toast.success('Circuit created successfully');
      }
      
      resetForm();
      return true;
    } catch (error) {
      console.error('Failed to create circuit:', error);
      toast.error('Failed to create circuit');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CircuitFormContext.Provider
      value={{
        currentStep,
        formData,
        setCircuitData,
        addStep,
        updateStep,
        removeStep,
        nextStep,
        prevStep,
        resetForm,
        isSubmitting,
        submitForm,
      }}
    >
      {children}
    </CircuitFormContext.Provider>
  );
};
