export type UserType = 'personal' | 'company';

export interface StepValidation {
  isLoading: boolean;
  errors: {
    username?: string;
    email?: string;
    registration?: string;
    verification?: string;
  };
}

// Add the SetStepValidation type
export type SetStepValidation = React.Dispatch<React.SetStateAction<StepValidation>>;

export interface FormData {
  userType: UserType;
  firstName: string;
  lastName: string;
  cin?: string;
  companyName?: string;
  companyRC?: string;
  industry?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyCity?: string;
  companyCountry?: string;
  companyEmail?: string;
  companyWebsite?: string;
  personalPhone?: string;
  personalAddress?: string; 
  city?: string;
  country?: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  adminSecretKey: string;
  role?: string;
  requestAdminAccess?: boolean; // Track if user wants admin access
  validationError?: string; // Added for form validation errors
}

export const initialFormData: FormData = {
  userType: 'personal',
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  adminSecretKey: '',
  validationError: ''
};

// Add the MultiStepFormContextType
export interface MultiStepFormContextType {
  currentStep: number;
  formData: FormData;
  stepValidation: StepValidation;
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<FormData>) => void;
  validateUsername: () => Promise<boolean>;
  validateEmail: () => Promise<boolean>;
  registerUser: () => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  resetForm: () => void;
  validateCurrentStep: () => Promise<boolean>;
  submitForm: () => Promise<boolean>;
  goToStep: (step: number) => void;
}
