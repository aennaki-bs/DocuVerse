import { useState } from "react";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateCircuitStepOne from "./steps/CreateCircuitStepOne";
import CreateCircuitStepTwo from "./steps/CreateCircuitStepTwo";
import CreateCircuitStepDocumentType from "./steps/CreateCircuitStepDocumentType";
import CreateCircuitStepThree from "./steps/CreateCircuitStepThree";
import { GitBranch } from "lucide-react";

export type Step = 1 | 2 | 3 | 4;

export interface FormValues {
  title: string;
  descriptif?: string;
  documentTypeId?: number;
}

interface CreateCircuitDialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCircuitDialogContainer({
  open,
  onOpenChange,
  onSuccess,
}: CreateCircuitDialogContainerProps) {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    descriptif: "",
    documentTypeId: undefined,
  });
  const [errors, setErrors] = useState<{ title?: string; documentTypeId?: string }>({});

  const handleNext = () => {
    if (step === 1) {
      if (!formValues.documentTypeId) {
        setErrors({ documentTypeId: "Document type is required" });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!formValues.title || formValues.title.trim().length < 3) {
        setErrors({ title: "Title must be at least 3 characters" });
        return;
      }
      setErrors({});
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => setStep((prev) => (prev - 1) as Step);
  const handleEdit = (targetStep: Step) => setStep(targetStep);

  const handleClose = () => {
    setStep(1);
    setFormValues({ title: "", descriptif: "", documentTypeId: undefined });
    setErrors({});
    onOpenChange(false);
  };

  const handleFieldChange = (key: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleDocumentTypeChange = (documentTypeId: number) => {
    setFormValues((prev) => ({ ...prev, documentTypeId }));
    setErrors((prev) => ({ ...prev, documentTypeId: undefined }));
  };

  const handleSubmit = async () => {
    if (!formValues.documentTypeId) {
      setErrors({ documentTypeId: "Document type is required" });
      setStep(1);
      return;
    }
    if (!formValues.title || formValues.title.trim().length < 3) {
      setErrors({ title: "Title must be at least 3 characters" });
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    try {
      await circuitService.createCircuit({
        title: formValues.title,
        descriptif: formValues.descriptif || "",
        documentTypeId: formValues.documentTypeId,
        isActive: false,
        hasOrderedFlow: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success("Circuit created successfully");
      setFormValues({ title: "", descriptif: "", documentTypeId: undefined });
      setStep(1);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to create circuit");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
        <div className="bg-gradient-to-r from-[#1e3a8a]/50 to-[#0f172a]/50 border-b border-blue-500/20 py-5 px-6">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="bg-blue-500/20 p-1.5 rounded-lg">
              <GitBranch className="h-5 w-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white m-0 p-0">
              Create Circuit
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-200 m-0 pl-10">
            Create a new circuit for document workflow
          </DialogDescription>
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                1
              </div>
              <span className={step >= 1 ? "text-blue-100" : "text-blue-400"}>
                Type
              </span>
            </div>
            <div className="flex-1 mx-2 mt-4">
              <div
                className={`h-0.5 ${
                  step >= 2 ? "bg-blue-600" : "bg-blue-900/50"
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                2
              </div>
              <span className={step >= 2 ? "text-blue-100" : "text-blue-400"}>
                Title
              </span>
            </div>
            <div className="flex-1 mx-2 mt-4">
              <div
                className={`h-0.5 ${
                  step >= 3 ? "bg-blue-600" : "bg-blue-900/50"
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                3
              </div>
              <span className={step >= 3 ? "text-blue-100" : "text-blue-400"}>
                Details
              </span>
            </div>
            <div className="flex-1 mx-2 mt-4">
              <div
                className={`h-0.5 ${
                  step >= 4 ? "bg-blue-600" : "bg-blue-900/50"
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 4
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                4
              </div>
              <span className={step >= 4 ? "text-blue-100" : "text-blue-400"}>
                Review
              </span>
            </div>
          </div>

          <form
            className="space-y-6"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            {step === 1 && (
              <CreateCircuitStepDocumentType
                value={formValues.documentTypeId}
                onChange={handleDocumentTypeChange}
                disabled={isSubmitting}
                onNext={handleNext}
                onCancel={handleClose}
              />
            )}
            {step === 2 && (
              <CreateCircuitStepOne
                value={formValues.title}
                onChange={(val) => handleFieldChange("title", val)}
                error={errors.title}
                disabled={isSubmitting}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 3 && (
              <CreateCircuitStepTwo
                value={formValues.descriptif || ""}
                onChange={(val) => handleFieldChange("descriptif", val)}
                disabled={isSubmitting}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 4 && (
              <CreateCircuitStepThree
                title={formValues.title}
                descriptif={formValues.descriptif || ""}
                documentTypeId={formValues.documentTypeId}
                disabled={isSubmitting}
                onEdit={handleEdit}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
