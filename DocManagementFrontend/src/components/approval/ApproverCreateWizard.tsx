import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  X,
  User,
  Search,
  UserCheck,
  FileText,
  Settings,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import approvalService from "@/services/approvalService";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ApproverInfo } from "@/models/approval";

interface ApproverCreateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const MotionDiv = motion.div;

export default function ApproverCreateWizard({
  open,
  onOpenChange,
  onSuccess,
}: ApproverCreateWizardProps) {
  const [selectedUsers, setSelectedUsers] = useState<ApproverInfo[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ApproverInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApproverInfo[]>([]);
  const [existingApprovers, setExistingApprovers] = useState<ApproverInfo[]>(
    []
  );
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Steps configuration
  const steps: Step[] = [
    {
      id: 1,
      title: "Select Users",
      description: "Choose users to make approvers",
      icon: <Users className="h-5 w-5" />,
      completed: selectedUsers.length > 0,
    },
    {
      id: 2,
      title: "Add Comment",
      description: "Provide optional details",
      icon: <FileText className="h-5 w-5" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Review",
      description: "Confirm details",
      icon: <CheckCircle className="h-5 w-5" />,
      completed: false,
    },
  ];

  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      setSelectedUsers([]);
      setComment("");
      setSearchQuery("");
      setCurrentStep(1);
      fetchUsers();
    }
  }, [open]);

  // Filter users based on search query
  useEffect(() => {
    let results = [...availableUsers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.role && user.role.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(results);
  }, [searchQuery, availableUsers]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const existingApprovers = await approvalService.getAllApprovators();
      const eligibleUsers = await approvalService.getEligibleApprovers();

      // Store existing approvers
      setExistingApprovers(existingApprovers);

      // Filter out users who are already approvers
      const existingApproverIds = existingApprovers.map(
        (approver) => approver.userId
      );
      const filteredUsers = eligibleUsers.filter(
        (user) => !existingApproverIds.includes(user.userId)
      );

      setAvailableUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch eligible users:", error);
      toast.error("Failed to load eligible users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      setIsLoading(true);

      // Create approvers one by one
      const promises = selectedUsers.map(user => {
        const requestData = {
          userId: user.userId,
          comment: comment.trim() || undefined,
        };
        return approvalService.createApprovator(requestData);
      });

      await Promise.all(promises);

      onSuccess();
      const successMessage = selectedUsers.length === 1 
        ? `${selectedUsers[0].username} was added as an approver`
        : `${selectedUsers.length} users were added as approvers`;
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create approvers:", error);
      toast.error("Failed to create approvers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: ApproverInfo) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some(u => u.userId === user.userId);
      if (isAlreadySelected) {
        return prevSelected.filter(u => u.userId !== user.userId);
      } else {
        return [...prevSelected, user];
      }
    });
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(user => user.userId !== userId));
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRandomColor = (userId: number) => {
    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-green-600",
      "bg-amber-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-teal-600",
      "bg-red-600",
      "bg-cyan-600",
    ];
    return colors[userId % colors.length];
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 1 && selectedUsers.length === 0) {
      toast.error("Please select at least one user first");
      return;
    }

    if (currentStep < steps.length) {
      steps[currentStep - 1].completed = true;
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 1: Select Users
  const renderSelectUserStep = () => (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <div className="mb-2">
        <h3 className="text-lg font-medium text-white">Select Users</h3>
        <p className="text-blue-300 text-sm">
          Choose users who will be added as approvers
        </p>
      </div>

      {/* Available Users Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 text-blue-400 mr-2" />
            <h4 className="text-sm font-medium text-blue-200">
              Available Users
            </h4>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-blue-950/60 border-blue-900/40 focus:border-blue-500 text-blue-100 w-[180px] text-sm"
            />
          </div>
        </div>

        <div className="min-h-[180px] max-h-[180px] overflow-y-auto border border-blue-900/40 rounded-md bg-blue-950/30">
          {isLoadingUsers ? (
            <div className="space-y-1 p-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-2 p-2 rounded">
                  <Skeleton className="w-4 h-4 rounded bg-blue-900/40" />
                  <Skeleton className="h-4 w-32 bg-blue-900/40" />
                  <Skeleton className="h-5 w-14 ml-auto bg-blue-900/40 rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div>
              {filteredUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-900/30 cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <Checkbox
                    id={`user-${user.userId}`}
                    checked={selectedUsers.some(u => u.userId === user.userId)}
                    onCheckedChange={() => handleSelectUser(user)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <div className="font-medium text-blue-100 text-sm">
                    {user.username}
                  </div>
                  {user.role && (
                    <Badge className="ml-auto bg-blue-900/70 text-blue-300 px-2 py-0.5 text-xs">
                      {user.role}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Search className="h-8 w-8 text-blue-600/60 mb-1" />
              <h3 className="text-blue-300 font-medium text-sm">
                No matching users found
              </h3>
              <p className="text-blue-400/70 text-xs mt-1 max-w-xs">
                Try using a different search term
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <UserCheck className="h-8 w-8 text-blue-600/60 mb-1" />
              <h3 className="text-blue-300 font-medium text-sm">
                All users are already approvers
              </h3>
              <p className="text-blue-400/70 text-xs mt-1 max-w-xs">
                There are no additional users eligible
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Users Section */}
      <div className="space-y-2">
        <div className="flex items-center">
          <UserCheck className="h-4 w-4 text-blue-400 mr-2" />
          <h4 className="text-sm font-medium text-blue-200">
            Selected Users ({selectedUsers.length})
          </h4>
        </div>

        <div className="border border-blue-900/40 rounded-md bg-blue-950/30 p-2 min-h-[80px] max-h-[120px] overflow-y-auto">
          {selectedUsers.length > 0 ? (
            <div className="space-y-1">
              {selectedUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-2 bg-blue-900/30 p-2 rounded">
                  <div className="font-medium text-blue-100 text-sm flex-1">
                    {user.username}
                  </div>
                  {user.role && (
                    <Badge className="bg-blue-900/70 text-blue-300 px-2 py-0.5 text-xs">
                      {user.role}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6 ml-1"
                    onClick={() => handleRemoveUser(user.userId)}
                  >
                    <X className="h-3 w-3 text-blue-400" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-blue-400/50 text-xs italic text-center py-3">
              No users selected yet
            </div>
          )}
        </div>
      </div>
    </MotionDiv>
  );

  // Step 2: Add Comment
  const renderAddCommentStep = () => (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="mb-2">
        <h3 className="text-lg font-medium text-white">Add Comment</h3>
        <p className="text-blue-300 text-sm">
          Provide additional information about these approvers
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-950/30 p-3 rounded-md border border-blue-900/40">
          <div className="text-sm text-blue-200 mb-2">Selected Users:</div>
          <div className="flex flex-wrap gap-1">
            {selectedUsers.map((user) => (
              <Badge key={user.userId} className="bg-blue-900/60 text-blue-300 text-xs">
                {user.username}
                {user.role && ` (${user.role})`}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm text-blue-200">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Add additional details about these approvers..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-blue-950/60 border-blue-900/40 text-blue-100 min-h-[120px] resize-none focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-blue-400/70">
            Provide any additional information about the purpose of these
            approvers
          </p>
        </div>
      </div>
    </MotionDiv>
  );

  // Step 3: Review
  const renderReviewStep = () => (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="mb-2">
        <h3 className="text-lg font-medium text-white">Review</h3>
        <p className="text-blue-300 text-sm">Confirm approver details</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <h4 className="text-sm text-blue-400">Selected Users ({selectedUsers.length})</h4>
          <div className="bg-blue-950/60 p-2.5 rounded-md border border-blue-900/50 max-h-[100px] overflow-y-auto">
            {selectedUsers.length > 0 ? (
              <div className="space-y-1">
                {selectedUsers.map((user) => (
                  <div key={user.userId} className="flex items-center gap-2">
                    <div className="font-medium text-blue-100 text-sm">
                      {user.username}
                    </div>
                    {user.role && (
                      <Badge className="bg-blue-900/60 text-blue-300 text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-400/50 italic text-sm">
                No users selected
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-sm text-blue-400">Comment</h4>
          <div className="bg-blue-950/60 p-2.5 rounded-md border border-blue-900/50 min-h-[80px]">
            {comment ? (
              <p className="text-blue-100 whitespace-pre-wrap">{comment}</p>
            ) : (
              <p className="text-blue-400/50 italic text-sm">
                No comment provided
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 p-2.5 rounded-md border border-blue-800/30 flex items-start">
        <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          {selectedUsers.length === 1 
            ? "The user will be able to approve documents once added to the approvers list."
            : `These ${selectedUsers.length} users will be able to approve documents once added to the approvers list.`
          }
        </p>
      </div>
    </MotionDiv>
  );

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderSelectUserStep();
      case 2:
        return renderAddCommentStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1642] border-blue-900/30 text-white shadow-xl max-w-xl mx-auto rounded-xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-xl text-blue-100">
                Create New Approvers
              </DialogTitle>
            </div>
            <DialogDescription className="text-blue-300 text-sm">
              Add multiple users to the approvers list
            </DialogDescription>
          </DialogHeader>

          {/* Steps indicator */}
          <div className="px-6 py-3">
            <div className="flex items-center justify-between relative">
              {/* Connector line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-900/40 -translate-y-1/2 z-0"></div>

              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center z-10">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center relative",
                      currentStep === step.id
                        ? "bg-blue-600 text-white border-2 border-blue-500"
                        : step.completed
                        ? "bg-green-600 text-white"
                        : "bg-blue-950 border-2 border-blue-900/40 text-blue-400"
                    )}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : step.icon}
                  </div>

                  <div className="mt-1.5 text-center max-w-[100px]">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        currentStep === step.id
                          ? "text-blue-100"
                          : step.completed
                          ? "text-green-400"
                          : "text-blue-400/60"
                      )}
                    >
                      {step.title}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        currentStep === step.id
                          ? "text-blue-300"
                          : step.completed
                          ? "text-green-400/80"
                          : "text-blue-400/40"
                      )}
                    >
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2 border-t border-blue-900/30">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>

          {/* Footer with navigation */}
          <div className="border-t border-blue-900/40 p-3 bg-blue-950/50 flex items-center justify-between">
            <div>
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="bg-transparent border-blue-900/50 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 h-8 px-3 text-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/30 h-8 px-3 text-sm"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 1 && selectedUsers.length === 0}
                  className={cn(
                    "bg-blue-600 hover:bg-blue-700 transition-colors h-8 px-3 text-sm",
                    currentStep === 1 &&
                      selectedUsers.length === 0 &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || selectedUsers.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors h-8 px-3 text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
                      Creating...
                    </span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {selectedUsers.length === 1 ? "Create Approver" : `Create ${selectedUsers.length} Approvers`}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
