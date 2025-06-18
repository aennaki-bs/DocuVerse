import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Loader2,
  AlertCircle,
  Hash,
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

import lineElementsService from '@/services/lineElementsService';
import { CreateGeneralAccountsRequest } from '@/models/lineElements';

interface CreateGeneralAccountWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: 'Account Code',
    description: 'Enter unique alphanumeric code',
    icon: Hash,
  },
  {
    id: 2,
    title: 'Description',
    description: 'Account description',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Review & Create',
    description: 'Confirm account details',
    icon: Eye,
  },
];

const CreateGeneralAccountWizard: React.FC<CreateGeneralAccountWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form data
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  
  // Validation states
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [hasValidCodeFormat, setHasValidCodeFormat] = useState(false);
  const [codeError, setCodeError] = useState('');

  const resetWizard = () => {
    setCurrentStep(1);
    setCode('');
    setDescription('');
    setIsCodeValid(false);
    setHasValidCodeFormat(false);
    setCodeError('');
    setIsValidatingCode(false);
    setIsCreating(false);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  // Validate code format (alphanumeric and length)
  const validateCodeFormat = (value: string) => {
    const trimmedValue = value.trim();
    
    // Check length (1-20 characters as per validation schema)
    if (trimmedValue.length < 1 || trimmedValue.length > 20) {
      setHasValidCodeFormat(false);
      return false;
    }
    
    // Check if alphanumeric (letters and numbers only)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const isAlphanumeric = alphanumericRegex.test(trimmedValue);
    
    setHasValidCodeFormat(isAlphanumeric);
    return isAlphanumeric;
  };

  const validateCodeUniqueness = async (codeValue: string) => {
    if (!codeValue.trim()) return false;
    
    setIsValidatingCode(true);
    setCodeError('');
    
    try {
      const response = await lineElementsService.generalAccounts.validateCode(codeValue.trim());
      const isUnique = response.data || response === true;
      
      if (isUnique) {
        setIsCodeValid(true);
        setCodeError('');
        return true;
      } else {
        setIsCodeValid(false);
        setCodeError('This code already exists. Please choose a different code.');
        return false;
      }
    } catch (error) {
      console.error('Code validation error:', error);
      setIsCodeValid(false);
      setCodeError('Unable to validate code. Please try again.');
      return false;
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setIsCodeValid(false);
    setCodeError('');
    
    if (!validateCodeFormat(value)) {
      if (value.trim().length > 0) {
        setCodeError('Code must be alphanumeric (letters and numbers only, 1-20 characters)');
      }
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate code format first
      if (!hasValidCodeFormat) {
        setCodeError('Please enter a valid alphanumeric code (1-20 characters)');
        return;
      }
      
      // Then validate uniqueness
      const isUnique = await validateCodeUniqueness(code);
      if (!isUnique) return;
    }
    
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAccount = async () => {
    setIsCreating(true);
    
    try {
      const createRequest: CreateGeneralAccountsRequest = {
        code: code.trim(),
        description: description.trim(),
      };
      
      await lineElementsService.generalAccounts.create(createRequest);
      toast.success('General account created successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create general account:', error);
      toast.error(error.response?.data?.message || 'Failed to create general account');
    } finally {
      setIsCreating(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const canProceedToNext = () => {
    if (currentStep === 1) return hasValidCodeFormat;
    if (currentStep === 2) return description.trim().length > 0; // Description is required
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="code" className="text-blue-200 text-sm font-medium">
                Account Code *
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Enter unique account code (e.g., 6061, 7001, ACC001)"
                  className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isValidatingCode && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  )}
                  {!isValidatingCode && isCodeValid && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                  {!isValidatingCode && codeError && (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
              {codeError && (
                <p className="text-red-400 text-xs mt-1">{codeError}</p>
              )}
              {!codeError && hasValidCodeFormat && !isValidatingCode && !isCodeValid && (
                <p className="text-blue-400 text-xs mt-1">
                  Click Next to validate code uniqueness
                </p>
              )}
            </div>
            
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-2">Code Guidelines:</h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Must be 1-20 characters long</li>
                <li>• Only letters and numbers allowed (alphanumeric)</li>
                <li>• Must be unique across all general accounts</li>
                <li>• Examples: 6061, 7001, ACC001, BANK01</li>
                <li>• No spaces or special characters</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-blue-200 text-sm font-medium">
                Description *
              </Label>
              <div className="mt-1">
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed account description"
                  className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <p className="text-blue-400 text-xs mt-1">
                Provide a clear description of the general account (required)
              </p>
            </div>
            
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-2">Description Tips:</h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Be specific and descriptive</li>
                <li>• Include the purpose or type of account</li>
                <li>• Maximum 255 characters</li>
                <li>• Examples: "Bank Account - Main", "Expenses - Office Supplies"</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-3">Review Account Details:</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 text-sm">Code:</span>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-900/20">
                    {code}
                  </Badge>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-blue-300 text-sm">Description:</span>
                  <span className="text-blue-200 text-sm text-right max-w-xs">
                    {description.trim() || (
                      <span className="text-red-400 italic">No description provided</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/20 p-3 rounded-lg border border-green-900/30">
              <p className="text-green-300 text-sm">
                ✅ Ready to create! All information has been validated and is ready for submission.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-100 flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-blue-400" />
            Create New General Account - Step {currentStep} of {wizardSteps.length}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            {wizardSteps[currentStep - 1]?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center space-x-2 mb-6">
          {wizardSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center space-y-1">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                      ${status === 'completed' 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : status === 'current'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-400'
                      }
                    `}
                  >
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center max-w-16 ${
                      status === 'current' ? 'text-blue-300' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < wizardSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-500 mt-[-20px]" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePreviousStep}
            className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex space-x-2">
            {currentStep < wizardSteps.length ? (
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToNext() || isValidatingCode}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isValidatingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCreateAccount}
                disabled={isCreating || !description.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGeneralAccountWizard; 