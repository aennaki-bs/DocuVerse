
import { useState } from 'react';
import { toast } from 'sonner';
import circuitService from '@/services/circuitService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateCircuitStepOne from './steps/CreateCircuitStepOne';
import CreateCircuitStepTwo from './steps/CreateCircuitStepTwo';
import CreateCircuitStepThree from './steps/CreateCircuitStepThree';

interface CreateCircuitDialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export type Step = 1 | 2 | 3;

export interface FormValues {
  title: string;
  descriptif?: string;
}

export default function CreateCircuitDialogBase({
  open,
  onOpenChange,
  onSuccess
}: CreateCircuitDialogBaseProps) {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({ title: '', descriptif: '' });
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleNext = () => {
    if (step === 1) {
      if (!formValues.title || formValues.title.trim().length < 3) {
        setErrors({ title: 'Title must be at least 3 characters' });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => setStep((prev) => ((prev - 1) as Step));
  const handleEdit = (targetStep: Step) => setStep(targetStep);

  const handleClose = () => {
    setStep(1);
    setFormValues({ title: '', descriptif: '' });
    setErrors({});
    onOpenChange(false);
  };

  const handleFieldChange = (key: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async () => {
    if (!formValues.title || formValues.title.trim().length < 3) {
      setErrors({ title: 'Title must be at least 3 characters' });
      setStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      await circuitService.createCircuit({
        title: formValues.title,
        descriptif: formValues.descriptif || '',
        isActive: true,
        hasOrderedFlow: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Circuit created successfully');
      setFormValues({ title: '', descriptif: '' });
      setStep(1);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to create circuit');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogPanelClass = "bg-[#101942] border border-blue-900 shadow-2xl rounded-xl";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[480px] ${dialogPanelClass}`}>
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Create Circuit</DialogTitle>
          <DialogDescription>
            Create a new circuit for document workflow
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" autoComplete="off" onSubmit={e => e.preventDefault()}>
          {step === 1 && (
            <CreateCircuitStepOne
              value={formValues.title}
              onChange={(val) => handleFieldChange('title', val)}
              error={errors.title}
              disabled={isSubmitting}
              onNext={handleNext}
              onCancel={handleClose}
            />
          )}
          {step === 2 && (
            <CreateCircuitStepTwo
              value={formValues.descriptif || ''}
              onChange={(val) => handleFieldChange('descriptif', val)}
              disabled={isSubmitting}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <CreateCircuitStepThree
              title={formValues.title}
              descriptif={formValues.descriptif || ''}
              disabled={isSubmitting}
              onEdit={handleEdit}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
