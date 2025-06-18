import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import { DocumentStatus } from "@/models/documentCircuit";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowLeft, ArrowRight, Check } from "lucide-react";
import StatusFormStepOne from "./steps/StatusFormStepOne";
import StatusFormStepTwo from "./steps/StatusFormStepTwo";
import StatusFormStepThree from "./steps/StatusFormStepThree";

interface StatusFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  status?: DocumentStatus | null;
  circuitId?: number;
  stepId?: number;
}

export type Step = 1 | 2 | 3;

export interface FormValues {
  title: string;
  description: string;
  isInitial: boolean;
  isFinal: boolean;
  isFlexible: boolean;
}

export function StatusFormDialog({
  open,
  onOpenChange,
  onSuccess,
  status,
  circuitId,
  stepId,
}: StatusFormDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    description: "",
    isInitial: false,
    isFinal: false,
    isFlexible: false,
  });
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [existingInitialStatus, setExistingInitialStatus] =
    useState<boolean>(false);
  const [existingFinalStatus, setExistingFinalStatus] =
    useState<boolean>(false);

  // Check if there's already an initial or final status
  useEffect(() => {
    if (open && circuitId && !status) {
      const checkStatuses = async () => {
        try {
          const response = await api.get(`/Status/circuit/${circuitId}`);
          const statuses = response.data;
          const hasInitialStatus = statuses.some(
            (s: DocumentStatus) => s.isInitial
          );
          const hasFinalStatus = statuses.some(
            (s: DocumentStatus) => s.isFinal
          );
          setExistingInitialStatus(hasInitialStatus);
          setExistingFinalStatus(hasFinalStatus);
        } catch (error) {
          console.error("Error checking statuses:", error);
        }
      };
      checkStatuses();
    }
  }, [open, circuitId, status]);

  // Reset form state when dialog opens or status changes
  useEffect(() => {
    if (open) {
      if (status) {
        // Editing existing status - populate form with status data
        setFormValues({
          title: status.title || "",
          description: status.description || "",
          isInitial: status.isInitial || false,
          isFinal: status.isFinal || false,
          isFlexible: false,
        });
      } else {
        // Creating new status - reset form
        setFormValues({
          title: "",
          description: "",
          isInitial: false,
          isFinal: false,
          isFlexible: false,
        });
      }
      setStep(1);
      setErrors({});
    }
  }, [open, status]);

  const handleNext = () => {
    if (step === 1) {
      if (!formValues.title || formValues.title.trim().length < 3) {
        setErrors({ title: "Title must be at least 3 characters" });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => setStep((prev) => (prev - 1) as Step);
  const handleEdit = (targetStep: Step) => setStep(targetStep);

  const handleClose = () => {
    setStep(1);
    setFormValues({
      title: "",
      description: "",
      isInitial: false,
      isFinal: false,
      isFlexible: false,
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleFieldChange = (key: keyof FormValues, value: any) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [key]: value };

      // If setting isInitial to true, set isFinal to false
      if (key === "isInitial" && value === true) {
        newValues.isFinal = false;
      }

      // If setting isFinal to true, set isInitial to false
      if (key === "isFinal" && value === true) {
        newValues.isInitial = false;
      }

      return newValues;
    });

    if (key === "title") {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!formValues.title || formValues.title.trim().length < 3) {
      setErrors({ title: "Title must be at least 3 characters" });
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const statusData = {
        title: formValues.title,
        description: formValues.description,
        isRequired: false,
        isInitial: formValues.isInitial,
        isFinal: formValues.isFinal,
        isFlexible: false,
      };

      if (status) {
        // Update existing status
        await api.put(`/Status/${status.statusId}`, statusData);
        toast.success("Status updated successfully");
      } else if (circuitId) {
        // Create new circuit status
        await api.post(`/Status/circuit/${circuitId}`, statusData);
        toast.success("Status created successfully");
      } else if (stepId) {
        // Create new step status
        await api.post(`/Status/step/${stepId}`, statusData);
        toast.success("Status created successfully");
      } else {
        toast.error("Missing circuit or step ID");
        return;
      }

      // Call onSuccess and close the dialog
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error submitting status:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a8a]/50 to-[#0f172a]/50 border-b border-blue-500/20 py-5 px-6">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="bg-blue-500/20 p-1.5 rounded-lg">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white m-0 p-0">
              {status ? "Edit Status" : "Create New Status"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-200 m-0 pl-10">
            {status
              ? "Update the status details"
              : circuitId
              ? "Add a new status to this circuit"
              : "Add a new status to this step"}
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
                Title
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
                Description
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
                Options
              </span>
            </div>
          </div>

          <form
            className="space-y-6"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            {step === 1 && (
              <StatusFormStepOne
                value={formValues.title}
                onChange={(val) => handleFieldChange("title", val)}
                error={errors.title}
                disabled={isSubmitting}
                onNext={handleNext}
                onCancel={handleClose}
              />
            )}
            {step === 2 && (
              <StatusFormStepTwo
                value={formValues.description}
                onChange={(val) => handleFieldChange("description", val)}
                disabled={isSubmitting}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 3 && (
              <StatusFormStepThree
                values={formValues}
                onChange={handleFieldChange}
                disabled={isSubmitting}
                onEdit={handleEdit}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                existingInitialStatus={existingInitialStatus}
                existingFinalStatus={existingFinalStatus}
                isCircuitStatus={!!circuitId}
              />
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
