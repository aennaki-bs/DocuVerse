
import { useState } from 'react';
import StepOneTitle from './steps/StepOneTitle';
import StepTwoDescription from './steps/StepTwoDescription';
import StepThreeReview from './steps/StepThreeReview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex justify-center space-x-2 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold shadow-md transition-all border
              ${step === currentStep
                ? 'bg-blue-600 text-white border-blue-500 scale-110'
                : step < currentStep
                  ? 'bg-blue-900/40 text-blue-400 border-blue-500'
                  : 'bg-gray-900/50 text-gray-500 border-gray-700'
            }`}
          >
            {step < currentStep ? (
              <span>&#10003;</span>
            ) : (
              <span className="text-base">{step}</span>
            )}
          </div>
          {step < 3 && (
            <div
              className={`h-1 w-10 sm:w-12 md:w-16 rounded-full transition-colors
                ${step < currentStep ? 'bg-blue-600' : 'bg-gray-800'}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

// Step title component
const StepTitle = ({ currentStep }: { currentStep: number }) => {
  const titles = [
    'Circuit Title',
    'Circuit Description',
    'Review and Create'
  ];
  return (
    <h3 className="text-2xl font-semibold text-center text-white mb-2">{titles[currentStep - 1]}</h3>
  );
};

export default function MultiStepCircuitForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState({ title: '', descriptif: '' });
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFieldChange = (key: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (key === 'title') {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && !formValues.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleEditStep = (step: 1 | 2) => {
    setCurrentStep(step);
  };
  
  const handleSubmit = () => {
    // Handle form submission logic
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Handle success
      console.log('Form submitted:', formValues);
      
      // Reset form
      setFormValues({ title: '', descriptif: '' });
      setCurrentStep(1);
    }, 1000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <StepOneTitle 
              value={formValues.title} 
              onChange={(value) => handleFieldChange('title', value)} 
              error={errors.title}
            />
            <div className="flex justify-between pt-4">
              {/* No back button on first step */}
              <div></div>
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <StepTwoDescription 
              value={formValues.descriptif} 
              onChange={(value) => handleFieldChange('descriptif', value)} 
            />
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="bg-black border-none text-gray-200 hover:bg-blue-950"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <StepThreeReview
            title={formValues.title}
            descriptif={formValues.descriptif}
            onEdit={handleEditStep}
            onBack={handlePrevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <div>
            <StepOneTitle 
              value={formValues.title} 
              onChange={(value) => handleFieldChange('title', value)} 
              error={errors.title} 
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <StepIndicator currentStep={currentStep} />
      <StepTitle currentStep={currentStep} />
      <div className="mt-2 w-full max-w-2xl">{renderStep()}</div>
    </div>
  );
}
