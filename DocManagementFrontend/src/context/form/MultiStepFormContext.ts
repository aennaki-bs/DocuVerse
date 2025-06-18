import { createContext } from 'react';
import { MultiStepFormContextType, initialFormData } from './types';

const MultiStepFormContext = createContext<MultiStepFormContextType>({
  currentStep: 1,
  formData: initialFormData,
  stepValidation: { isLoading: false, errors: {} },
  nextStep: () => {},
  prevStep: () => {},
  setCurrentStep: () => {},
  setFormData: () => {},
  validateUsername: async () => false,
  validateEmail: async () => false,
  registerUser: async () => false,
  verifyEmail: async () => false,
  resetForm: () => {},
  validateCurrentStep: async () => false,
  submitForm: async () => false,
  goToStep: () => {},
});

export default MultiStepFormContext;
