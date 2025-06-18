import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Hash,
  FileText,
  Settings,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import lineElementsService from "@/services/lineElementsService";
import { UniteCode, CreateItemRequest } from "@/models/lineElements";

interface CreateItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableUniteCodes: UniteCode[];
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
    title: "Item Code",
    description: "Enter unique item code",
    icon: Hash,
  },
  {
    id: 2,
    title: "Basic Information",
    description: "Item description",
    icon: FileText,
  },
  {
    id: 3,
    title: "Unit Configuration",
    description: "Select measurement unit",
    icon: Settings,
  },
  {
    id: 4,
    title: "Review & Create",
    description: "Confirm item details",
    icon: Eye,
  },
];

const CreateItemWizard: React.FC<CreateItemWizardProps> = ({
  open,
  onOpenChange,
  onSuccess,
  availableUniteCodes,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Form data
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [unite, setUnite] = useState("");

  // Validation states
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [hasBasicCodeFormat, setHasBasicCodeFormat] = useState(false);
  const [codeError, setCodeError] = useState("");

  const resetWizard = () => {
    setCurrentStep(1);
    setCode("");
    setDescription("");
    setUnite("");
    setIsCodeValid(false);
    setHasBasicCodeFormat(false);
    setCodeError("");
    setIsValidatingCode(false);
    setIsCreating(false);
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const validateCodeFormat = (value: string) => {
    const trimmedValue = value.trim();
    const isValid = trimmedValue.length >= 1 && trimmedValue.length <= 50;
    setHasBasicCodeFormat(isValid);
    return isValid;
  };

  const validateCodeUniqueness = async (codeValue: string) => {
    if (!codeValue.trim()) return false;

    setIsValidatingCode(true);
    setCodeError("");

    try {
      const isUnique = await lineElementsService.items.validateCode(
        codeValue.trim()
      );

      if (isUnique) {
        setIsCodeValid(true);
        setCodeError("");
        return true;
      } else {
        setIsCodeValid(false);
        setCodeError(
          "This code already exists. Please choose a different code."
        );
        return false;
      }
    } catch (error) {
      console.error("Code validation error:", error);
      setIsCodeValid(false);
      setCodeError("Unable to validate code. Please try again.");
      return false;
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setIsCodeValid(false);
    setCodeError("");
    validateCodeFormat(value);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate code uniqueness before proceeding
      if (!hasBasicCodeFormat) {
        setCodeError("Please enter a valid code (1-50 characters)");
        return;
      }

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

  const handleCreateItem = async () => {
    setIsCreating(true);

    try {
      const createRequest: CreateItemRequest = {
        code: code.trim(),
        description: description.trim() || undefined,
        unite: unite,
      };

      await lineElementsService.items.create(createRequest);
      toast.success("Item created successfully");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Failed to create item:", error);
      toast.error(error.response?.data?.message || "Failed to create item");
    } finally {
      setIsCreating(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  const isStepValid = (stepId: number) => {
    switch (stepId) {
      case 1:
        return isCodeValid;
      case 2:
        return true; // Description is optional
      case 3:
        return unite.trim().length > 0; // Unit is required
      case 4:
        return true;
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 1) return hasBasicCodeFormat;
    if (currentStep === 2) return true; // Description is optional
    if (currentStep === 3) return unite.trim().length > 0; // Unit is required
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="code"
                className="text-blue-200 text-sm font-medium"
              >
                Item Code *
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Enter unique item code (e.g., ITM001, PROD-A1)"
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
              {!codeError &&
                hasBasicCodeFormat &&
                !isValidatingCode &&
                !isCodeValid && (
                  <p className="text-blue-400 text-xs mt-1">
                    Click Next to validate code uniqueness
                  </p>
                )}
            </div>

            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-2">
                Code Guidelines:
              </h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Must be 1-50 characters long</li>
                <li>• Should be unique across all items</li>
                <li>• Use clear, descriptive codes (e.g., ITM001, PROD-A1)</li>
                <li>• Avoid special characters for better compatibility</li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="description"
                className="text-blue-200 text-sm font-medium"
              >
                Description (Optional)
              </Label>
              <div className="mt-1">
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed item description (optional)"
                  className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <p className="text-blue-400 text-xs mt-1">
                Provide a clear, detailed description of the item (optional)
              </p>
            </div>

            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-2">
                Description Tips:
              </h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Be specific and descriptive when provided</li>
                <li>• Include key characteristics or specifications</li>
                <li>• Avoid abbreviations when possible</li>
                <li>• Maximum 255 characters</li>
                <li>• Can be left empty if not needed</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="unite"
                className="text-blue-200 text-sm font-medium"
              >
                Unit Code *
              </Label>
              <div className="mt-1">
                <Select value={unite} onValueChange={setUnite}>
                  <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a unit code" />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
                    {availableUniteCodes.map((unit) => (
                      <SelectItem
                        key={unit.code}
                        value={unit.code}
                        className="text-white hover:bg-blue-900/30"
                      >
                        {unit.code} - {unit.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-blue-400 text-xs mt-1">
                Select a measurement unit for the item (required)
              </p>
            </div>

            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-2">
                Unit Information:
              </h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Unit codes define how the item is measured</li>
                <li>• Required for all items</li>
                <li>• Can be changed later if needed</li>
                <li>• Available units: {availableUniteCodes.length} options</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h4 className="text-blue-200 text-sm font-medium mb-3">
                Review Item Details:
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 text-sm">Code:</span>
                  <Badge
                    variant="outline"
                    className="text-blue-400 border-blue-500/30 bg-blue-900/20"
                  >
                    {code}
                  </Badge>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-blue-300 text-sm">Description:</span>
                  <span className="text-blue-200 text-sm text-right max-w-xs">
                    {description.trim() ? (
                      description
                    ) : (
                      <span className="text-blue-400 italic">
                        No description
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 text-sm">Unit:</span>
                  <span className="text-blue-200 text-sm">
                    {unite ? (
                      <Badge
                        variant="outline"
                        className="text-amber-400 border-amber-500/30 bg-amber-900/20"
                      >
                        {unite} -{" "}
                        {
                          availableUniteCodes.find((u) => u.code === unite)
                            ?.description
                        }
                      </Badge>
                    ) : (
                      <span className="text-red-400 italic">
                        No unit selected
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 p-3 rounded-lg border border-green-900/30">
              <p className="text-green-300 text-sm">
                ✅ Ready to create! All information has been validated and is
                ready for submission.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-100 flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-400" />
            Create New Item - Step {currentStep} of {wizardSteps.length}
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
                      ${
                        status === "completed"
                          ? "bg-green-600 border-green-600 text-white"
                          : status === "current"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-gray-700 border-gray-600 text-gray-400"
                      }
                    `}
                  >
                    {status === "completed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center max-w-16 ${
                      status === "current" ? "text-blue-300" : "text-gray-400"
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
        <div className="min-h-[300px] mb-6">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePreviousStep}
            className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
          >
            {currentStep === 1 ? "Cancel" : "Previous"}
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
                  "Next"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCreateItem}
                disabled={isCreating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Item"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemWizard;
