import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
  CheckCircle,
  Search,
  UserRound,
  PencilIcon,
} from "lucide-react";
import {
  UserOption,
  UserSearchSelect,
} from "@/components/user/UserSearchSelect";
import { Textarea } from "@/components/ui/textarea";
import approvalService from "@/services/approvalService";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Approver interface to match what comes from the API
interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

interface ApproverEditWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  approver: Approver | null;
}

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

// Form data interface
interface FormData {
  userId: number;
  username: string;
  comment: string;
}

const MotionDiv = motion.div;

export default function ApproverEditWizard({
  open,
  onOpenChange,
  onSuccess,
  approver,
}: ApproverEditWizardProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    userId: 0,
    username: "",
    comment: "",
  });

  // Initialize form data when dialog opens and approver changes
  useEffect(() => {
    if (open && approver) {
      setCurrentStep(1);
      setFormData({
        userId: approver.userId,
        username: approver.username,
        comment: approver.comment || "",
      });
    }
  }, [open, approver]);

  // Step definitions
  const steps: Step[] = [
    {
      id: 1,
      title: "Edit Info",
      description: "Update approver information",
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Review",
      description: "Confirm changes",
      icon: <CheckCircle className="h-4 w-4" />,
      completed: false,
    },
  ];

  const TOTAL_STEPS = steps.length;

  const handleUpdateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    // For the edit form, we only need to validate that at least the user ID exists
    // which should always be true since we're editing an existing approver
    return true;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !approver) return;

    try {
      setIsSubmitting(true);
      toast.loading("Updating approver...");

      // Prepare the request data
      const requestData = {
        userId: formData.userId,
        comment: formData.comment.trim() || undefined,
      };

      // Call the API to update the approver
      await approvalService.updateApprovator(approver.id, requestData);

      toast.dismiss();
      toast.success(`Approver "${formData.username}" updated successfully`);

      onSuccess(); // Notify parent component
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Failed to update approver:", error);
      toast.dismiss();
      toast.error("Failed to update approver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    };

    switch (currentStep) {
      case 1: // Edit Info
        return (
          <MotionDiv
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              <div className="bg-blue-950/40 p-4 rounded-lg border border-blue-900/40 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900/60 p-2 rounded-full">
                    <UserRound className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-blue-100">
                      {formData.username}
                    </h3>
                    {/* <p className="text-sm text-blue-400">User ID: {formData.userId}</p> */}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="comment" className="text-blue-200">
                    Comment (Optional)
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment or description for this approver..."
                    className="mt-1.5 bg-blue-950/50 border-blue-900/50 text-blue-100 resize-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.comment}
                    onChange={(e) =>
                      handleUpdateFormData("comment", e.target.value)
                    }
                  />
                  <p className="text-sm text-blue-400 mt-1">
                    This comment will help identify the approver's role or
                    purpose.
                  </p>
                </div>
              </div>
            </div>
          </MotionDiv>
        );

      case 2: // Review
        return (
          <MotionDiv
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-6">
              <div className="bg-blue-950/40 p-5 rounded-lg border border-blue-900/40">
                <h3 className="text-lg font-medium text-blue-100 mb-4">
                  Review Approver Changes
                </h3>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-blue-400">User</span>
                    <span className="text-blue-100 flex items-center mt-1">
                      <User className="h-4 w-4 mr-2 text-blue-400" />
                      {formData.username}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-blue-400">Comment</span>
                    {formData.comment ? (
                      <span className="text-blue-100 mt-1">
                        {formData.comment}
                      </span>
                    ) : (
                      <span className="text-blue-300/50 italic text-sm mt-1">
                        No comment provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 p-4 rounded-md border border-blue-800/30 flex items-start">
                <Check className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">
                  Updating this approver will save the changes immediately.
                </p>
              </div>
            </div>
          </MotionDiv>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Approver</DialogTitle>
          <DialogDescription>
            Update details for approver "{approver?.username}"
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-4 mt-2">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2",
                    step.id === currentStep
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : step.completed
                      ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500"
                      : "border-gray-300 text-gray-500 dark:border-gray-700"
                  )}
                >
                  {step.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon || step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    step.id === currentStep
                      ? "text-blue-600 dark:text-blue-500"
                      : step.completed
                      ? "text-green-600 dark:text-green-500"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 hidden sm:block",
                    step.id === currentStep &&
                      "text-blue-600 dark:text-blue-500"
                  )}
                >
                  {step.description}
                </span>
              </div>
            ))}
          </div>

          {/* Progress line */}
          <div className="relative mt-4 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div
                className="h-1 bg-blue-600 dark:bg-blue-500 rounded transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-2 min-h-[250px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2" /> Updating...
                  </>
                ) : (
                  <>
                    <PencilIcon className="mr-2 h-4 w-4" /> Update Approver
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
