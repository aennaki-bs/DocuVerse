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
  Users,
  Settings,
  FileText,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  ApprovalGroupFormData,
  ApprovalRuleType,
  ApproverInfo,
} from "@/models/approval";
import approvalService from "@/services/approvalService";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Step components
import { GroupDetailsStep } from "./steps/GroupDetailsStep";
import { SelectUsersStep } from "./steps/SelectUsersStep";
import { RuleSelectionStep } from "./steps/RuleSelectionStep";
import { ReviewStep } from "./steps/ReviewStep";

interface ApprovalGroupCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ExtendedReviewStepProps {
  formData: ApprovalGroupFormData;
  onEdit?: (step: number) => void;
}

const MotionDiv = motion.div;

export default function ApprovalGroupCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApprovalGroupCreateDialogProps) {
  // Form state
  const [formData, setFormData] = useState<ApprovalGroupFormData>({
    name: "",
    comment: "",
    selectedUsers: [],
    ruleType: ApprovalRuleType.Any,
  });

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ApproverInfo[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData({
        name: "",
        comment: "",
        selectedUsers: [],
        ruleType: ApprovalRuleType.Any,
      });
      fetchAvailableUsers();
    }
  }, [open]);

  // Step definitions
  const steps = [
    {
      id: 1,
      title: "Group Details",
      description: "Name and basic information",
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Approval Rules",
      description: "Set approval requirements",
      icon: <Settings className="h-4 w-4" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Select Users",
      description: "Add users to the group",
      icon: <UserRound className="h-4 w-4" />,
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: "Review",
      description: "Confirm group details",
      icon: <Check className="h-4 w-4" />,
      completed: false,
    },
  ];

  const TOTAL_STEPS = steps.length;

  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // For approval groups, get eligible approvers (accessible to both Admins and FullUsers)
      // Unlike individual approver creation, we don't need to filter out existing approvers
      const users = await approvalService.getEligibleApprovers();

      setAvailableUsers(users);
    } catch (error) {
      console.error("Failed to fetch available users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdateFormData = (
    field: keyof ApprovalGroupFormData,
    value: string | ApproverInfo[] | ApprovalRuleType
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Group Details
        if (!formData.name.trim()) {
          toast.error("Group name is required");
          return false;
        }
        return true;
      case 2: // Approval Rules
        // This step is always valid as we have a default selection
        return true;
      case 3: // Select Users
        if (formData.selectedUsers.length === 0) {
          toast.error("Please select at least 2 users for the approval group");
          return false;
        }
        if (formData.selectedUsers.length < 2) {
          toast.error("Approval groups require a minimum of 2 users to be effective");
          return false;
        }
        return true;
      case 4: // Review
        // Final validation before submission
        if (formData.selectedUsers.length === 0) {
          toast.error("Please select at least 2 users for the approval group");
          return false;
        }
        if (formData.selectedUsers.length < 2) {
          toast.error("Cannot create approval group with less than 2 users");
          return false;
        }
        return true;
      default:
        return true;
    }
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
    if (!validateCurrentStep()) return;

    // Final validation before API call
    if (formData.selectedUsers.length < 2) {
      toast.error("Cannot create an approval group with less than 2 members");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the request data
      const requestData = {
        name: formData.name,
        comment: formData.comment,
        userIds: formData.selectedUsers.map((user) => user.userId),
        ruleType: formData.ruleType,
      };

      // Log the request payload
      console.log("Creating approval group with payload:", requestData);

      // Call the API to create the group
      await approvalService.createApprovalGroup(requestData);

      onSuccess(); // Notify parent component
      toast.success("Approval group created successfully!");
    } catch (error) {
      console.error("Failed to create approval group:", error);
      toast.error("Failed to create approval group");
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
      case 1:
        return (
          <MotionDiv
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <GroupDetailsStep
              name={formData.name}
              comment={formData.comment}
              onNameChange={(value) => handleUpdateFormData("name", value)}
              onCommentChange={(value) =>
                handleUpdateFormData("comment", value)
              }
            />
          </MotionDiv>
        );
      case 2:
        return (
          <MotionDiv
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <RuleSelectionStep
              selectedRule={formData.ruleType}
              onRuleChange={(value) =>
                handleUpdateFormData("ruleType", value as ApprovalRuleType)
              }
            />
          </MotionDiv>
        );
      case 3:
        return (
          <MotionDiv
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <SelectUsersStep
              selectedUsers={formData.selectedUsers}
              availableUsers={availableUsers}
              isLoading={isLoadingUsers}
              isSequential={formData.ruleType === "Sequential"}
              onSelectedUsersChange={(users) =>
                handleUpdateFormData("selectedUsers", users)
              }
            />
          </MotionDiv>
        );
      case 4:
        return (
          <MotionDiv
            key="step4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <ReviewStep formData={formData} />
          </MotionDiv>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] max-w-3xl mx-auto rounded-xl h-[90vh] max-h-[700px] flex flex-col p-5">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-lg text-blue-100">
              Create Approval Group
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300 text-xs">
            Create a new group for managing document approvals
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-1 transition-all duration-200",
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : step.completed
                    ? "bg-green-600/70 text-white"
                    : "bg-blue-900/50 text-blue-300"
                )}
              >
                {step.completed ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    currentStep === step.id
                      ? "text-blue-200"
                      : step.completed
                      ? "text-green-400"
                      : "text-blue-400/70"
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "text-[10px] hidden sm:block",
                    currentStep === step.id
                      ? "text-blue-300/90"
                      : step.completed
                      ? "text-green-400/70"
                      : "text-blue-400/50"
                  )}
                >
                  {step.description}
                </p>
              </div>
              {step.id < steps.length && (
                <div
                  className={cn(
                    "absolute top-4 left-[calc(50%+4px)] w-[calc(100%-8px)] h-0.5",
                    step.completed ? "bg-green-500/50" : "bg-blue-900/50"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content - The flex-grow allows this to take remaining space */}
        <div className="flex-grow overflow-auto p-1 my-1">
          {renderStepContent()}
        </div>

        {/* Actions - Fixed at bottom */}
        <DialogFooter className="flex justify-between mt-2 pt-2 border-t border-blue-900/40 shrink-0">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-blue-500/30 text-blue-300 hover:bg-blue-900/20 hover:text-blue-200 h-8 px-3 py-1"
                size="sm"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/30 h-8 px-3 py-1"
              size="sm"
            >
              Cancel
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={currentStep === 3 && formData.selectedUsers.length < 2}
                className="bg-blue-600 hover:bg-blue-700 h-8 px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
                title={
                  currentStep === 3 && formData.selectedUsers.length < 2
                    ? "Select at least 2 users to continue"
                    : ""
                }
              >
                Next
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 h-8 px-3 py-1"
                size="sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Create Group
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
