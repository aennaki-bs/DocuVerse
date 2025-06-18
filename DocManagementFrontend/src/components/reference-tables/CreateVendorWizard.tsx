import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Truck, MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import vendorService from "@/services/vendorService";
import { CreateVendorRequest } from "@/models/vendor";

interface CreateVendorWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: "Vendor Code",
    description: "Enter and validate vendor code",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "Vendor Name", 
    description: "Enter vendor name",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "Address Details",
    description: "Enter address, city, and country",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Review information and create vendor",
    icon: <Eye className="h-5 w-5" />,
  },
];

export default function CreateVendorWizard({ isOpen, onClose }: CreateVendorWizardProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidationMessage, setCodeValidationMessage] = useState("");

  const [formData, setFormData] = useState({
    vendorCode: "",
    name: "",
    address: "",
    city: "",
    country: "",
  });

  // Code validation mutation
  const validateCodeMutation = useMutation({
    mutationFn: (vendorCode: string) => vendorService.validateCode(vendorCode),
    onSuccess: (isValid) => {
      setIsCodeValid(isValid);
      if (isValid) {
        setCodeValidationMessage("✓ Code is available");
      } else {
        setCodeValidationMessage("✗ Code already exists");
      }
      setIsValidatingCode(false);
    },
    onError: () => {
      setIsCodeValid(false);
      setCodeValidationMessage("✗ Error validating code");
      setIsValidatingCode(false);
    },
  });

  // Create vendor mutation
  const createMutation = useMutation({
    mutationFn: vendorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create vendor");
    },
  });

  const handleClose = () => {
    setCurrentStep(1);
    setIsCodeValid(false);
    setCodeValidationMessage("");
    setFormData({
      vendorCode: "",
      name: "",
      address: "",
      city: "",
      country: "",
    });
    onClose();
  };

  const handleCodeChange = (value: string) => {
    const upperCode = value.toUpperCase();
    setFormData({ ...formData, vendorCode: upperCode });
    setIsCodeValid(false);
    setCodeValidationMessage("");
    
    // Auto-validate if code has at least 2 characters
    if (upperCode.length >= 2) {
      setIsValidatingCode(true);
      validateCodeMutation.mutate(upperCode);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const createRequest: CreateVendorRequest = {
        vendorCode: formData.vendorCode.trim(),
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
      };
      await createMutation.mutateAsync(createRequest);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.vendorCode.length >= 2 && isCodeValid;
      case 2:
        return formData.name.trim().length > 0;
      case 3:
        return true; // Address fields are optional
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendorCode" className="text-blue-200">
                Vendor Code *
              </Label>
              <Input
                id="vendorCode"
                value={formData.vendorCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Enter vendor code (min 2 characters)"
                className="bg-gray-800 border-gray-600 text-white"
                maxLength={10}
              />
              {formData.vendorCode.length >= 2 && (
                <div className="mt-2 flex items-center gap-2">
                  {isValidatingCode ? (
                    <div className="flex items-center gap-2 text-blue-400">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Validating...</span>
                    </div>
                  ) : (
                    <span className={`text-sm ${isCodeValid ? "text-green-400" : "text-red-400"}`}>
                      {codeValidationMessage}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-300 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              The vendor code must be unique and at least 2 characters long.
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-blue-200">
                Vendor Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter vendor name"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-sm">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Code "{formData.vendorCode}" is valid and available.
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-blue-200">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter vendor address"
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-blue-200">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-blue-200">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Enter country"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-300 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Address fields are optional but recommended for complete vendor information.
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-200 mb-3">Review Vendor Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vendor Code:</span>
                  <span className="text-white font-mono">{formData.vendorCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vendor Name:</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white">{formData.address || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">City:</span>
                  <span className="text-white">{formData.city || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Country:</span>
                  <span className="text-white">{formData.country || "Not provided"}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-sm">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Ready to create vendor. Please review the information above.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-blue-400 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Vendor
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === step.id
                  ? "border-blue-500 bg-blue-500 text-white"
                  : currentStep > step.id
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-gray-600 bg-gray-800 text-gray-400"
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.id ? "bg-green-500" : "bg-gray-600"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-blue-200">{steps[currentStep - 1].title}</h3>
          <p className="text-gray-400 text-sm">{steps[currentStep - 1].description}</p>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrevious}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </>
            )}
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedFromStep(currentStep)}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {createMutation.isPending ? "Creating..." : "Create Vendor"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 