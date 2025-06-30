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
  Pencil,
} from "lucide-react";
import {
  ApprovalGroup,
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

interface ApprovalGroupEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  group: ApprovalGroup | null;
}

const MotionDiv = motion.div;

export default function ApprovalGroupEditDialog({
  open,
  onOpenChange,
  onSuccess,
  group,
}: ApprovalGroupEditDialogProps) {
  // Form state
  const [formData, setFormData] = useState<ApprovalGroupFormData>({
    name: "",
    comment: "",
    selectedUsers: [],
    ruleType: "Any",
  });

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ApproverInfo[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Reset form when dialog opens and populate with group data
  useEffect(() => {
    if (open && group) {
      // Reset the current step
      setCurrentStep(1);

      // Initialize form data with group values
      setFormData({
        name: group.name || "",
        comment: group.comment || "",
        selectedUsers:
          group.approvers?.map((a) => ({
            userId: a.userId,
            username: a.username,
          })) || [],
        ruleType: (group.ruleType as ApprovalRuleType) || "Any",
      });

      // Fetch available users
      fetchAvailableUsers();
    }
  }, [open, group]);

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
      // For editing approval groups, get all eligible approvers (all Admins and FullUsers)
      // Then filter out users who are already in the current group
      const allEligibleUsers = await approvalService.getEligibleApprovers();
      
      // Filter out users who are already in the current group
      const currentGroupUserIds = group?.approvers?.map(a => a.userId) || [];
      const availableUsers = allEligibleUsers.filter(
        user => !currentGroupUserIds.includes(user.userId)
      );
      
      setAvailableUsers(availableUsers);
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
          toast.error("Cannot update approval group with less than 2 users");
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
    if (!group) return;

    // Final validation before API call
    if (formData.selectedUsers.length < 2) {
      toast.error("Cannot update an approval group with less than 2 members");
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
      console.log("Updating approval group with payload:", requestData);

      // Call the API to update the group
      await approvalService.updateApprovalGroup(group.id, requestData);

      onSuccess(); // Notify parent component
      toast.success("Approval group updated successfully!");
    } catch (error) {
      console.error("Failed to update approval group:", error);
      toast.error("Failed to update approval group");
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
              availableUsers={availableUsers}
              selectedUsers={formData.selectedUsers}
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Approval Group</DialogTitle>
          <DialogDescription>
            Modify the details of the "{group?.name}" approval group
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
        <div className="py-2 min-h-[300px]">{renderStepContent()}</div>

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
              <Button 
                type="button" 
                onClick={nextStep} 
                disabled={isSubmitting || (currentStep === 3 && formData.selectedUsers.length < 2)}
                title={
                  currentStep === 3 && formData.selectedUsers.length < 2
                    ? "Select at least 2 users to continue"
                    : ""
                }
              >
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
                    <Pencil className="mr-2 h-4 w-4" /> Update Group
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
