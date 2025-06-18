import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  ArrowRight,
  X,
  FileType,
  Check,
  FileText,
  Tag,
  CheckCircle,
  Save,
  Users,
} from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import documentService from "@/services/documentService";
import { DocumentType, TierType } from "@/models/document";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const typeSchema = z.object({
  typeName: z.string().min(2, "Type name must be at least 2 characters."),
  typeAttr: z.string().optional(),
  tierType: z.nativeEnum(TierType).optional().default(TierType.None),
});

type DocumentTypeFormProps = {
  documentType?: DocumentType | null;
  isEditMode?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const MotionDiv = motion.div;

export const DocumentTypeForm = ({
  documentType,
  isEditMode = false,
  onSuccess,
  onCancel,
}: DocumentTypeFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTypeNameValid, setIsTypeNameValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof typeSchema>>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      typeName: documentType?.typeName || "",
      typeAttr: documentType?.typeAttr || "",
      tierType: documentType?.tierType || TierType.None,
    },
  });

  useEffect(() => {
    if (documentType && isEditMode) {
      form.reset({
        typeName: documentType.typeName || "",
        typeAttr: documentType.typeAttr || "",
        tierType: documentType.tierType || TierType.None,
      });

      // In edit mode, start from step 1 to allow users to review and edit all fields
      setCurrentStep(1);
      // Mark the type name as valid since it's an existing document type
      setIsTypeNameValid(true);
    }
  }, [documentType, isEditMode, form]);

  // Step definitions
  const steps: Step[] = [
    {
      id: 1,
      title: "Type Name",
      description: "Create a unique name",
      icon: <Tag className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Type Tier",
      description: "Select tier type",
      icon: <Users className="h-4 w-4" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Type Details",
      description: "Add additional info",
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: "Review",
      description: "Confirm details",
      icon: <CheckCircle className="h-4 w-4" />,
      completed: false,
    },
  ];

  const TOTAL_STEPS = steps.length;

  const validateTypeName = async (typeName: string) => {
    if (isEditMode && typeName === documentType?.typeName) {
      return true;
    }

    if (typeName.length < 2) return false;

    setIsValidating(true);
    try {
      const exists = await documentService.validateTypeName(typeName);
      setIsTypeNameValid(!exists);
      return !exists;
    } catch (error) {
      console.error("Error validating type name:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const typeName = form.getValues("typeName");
      const isValid = await validateTypeName(typeName);

      if (isValid) {
        setCurrentStep(2);
      } else {
        form.setError("typeName", {
          type: "manual",
          message: "This type name already exists.",
        });
      }
    } else if (currentStep === 2) {
      // Move to Type Details step
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Move to review
      setCurrentStep(4);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    form.reset();
    onCancel();
  };

  const onTypeNameChange = () => {
    setIsTypeNameValid(null);
    // Clear the error when user changes the name
    form.clearErrors("typeName");
  };

  const onSubmit = async (data: z.infer<typeof typeSchema>) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      if (isEditMode && documentType?.id) {
        await documentService.updateDocumentType(documentType.id, {
          typeName: data.typeName,
          typeAttr: data.typeAttr || undefined,
          documentCounter: documentType.documentCounter,
          tierType: data.tierType || undefined,
        });
        toast.success("Document type updated successfully");
      } else {
        await documentService.createDocumentType({
          typeName: data.typeName,
          typeAttr: data.typeAttr || undefined,
          tierType: data.tierType || undefined,
        });
        toast.success("Document type created successfully");
      }
      form.reset();
      setCurrentStep(1);
      onSuccess();
    } catch (error: any) {
      console.error(
        isEditMode
          ? "Failed to update document type:"
          : "Failed to create document type:",
        error
      );

      // Extract specific error message if available
      let errorMessage = isEditMode
        ? "Failed to update document type"
        : "Failed to create document type";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.errors) {
          // Handle validation errors array
          if (Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join(". ");
          } else if (typeof error.response.data.errors === "object") {
            // Handle validation errors object
            errorMessage = Object.values(error.response.data.errors)
              .flat()
              .join(". ");
          }
        }
      } else if (error.message) {
        // If no response data but there's an error message
        errorMessage = error.message;
      }

      toast.error(
        `${isEditMode ? "Update" : "Creation"} failed: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate form for review step to ensure proper submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form.getValues());
  };

  const renderStepContent = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    };

    switch (currentStep) {
      case 1: // Type Name
        return (
          <MotionDiv
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <Tag className="mx-auto h-12 w-12 text-blue-500 mb-3 p-2 bg-blue-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">Type Name</h3>
                <p className="text-sm text-blue-300/70">
                  Create a unique name for this document type
                </p>
              </div>

              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="typeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-100">
                          Type Name*
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Enter document type name"
                              className={`bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white ${
                                isTypeNameValid === false
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : isTypeNameValid === true
                                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                                  : ""
                              }`}
                              onChange={(e) => {
                                field.onChange(e);
                                onTypeNameChange();
                              }}
                            />
                            {isTypeNameValid === true && (
                              <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                            )}
                            {isValidating && (
                              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-blue-500 animate-spin" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-sm text-blue-300/70">
                          This name will be displayed throughout the system
                        </FormDescription>
                        <FormMessage className="text-sm mt-1 text-red-400" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </MotionDiv>
        );

      case 2: // Type Tier
        return (
          <MotionDiv
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <Users className="mx-auto h-12 w-12 text-blue-500 mb-3 p-2 bg-blue-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">
                  Type Tier
                </h3>
                <p className="text-sm text-blue-300/70">
                  Select the tier type for this document type
                </p>
              </div>

              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tierType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-100">
                          Tier Type*
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => {
                              field.onChange(parseInt(value) as TierType);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white">
                                <SelectValue placeholder="Select tier type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#111633] border-blue-900/40 text-white">
                              <SelectItem value={TierType.None.toString()}>
                                None
                              </SelectItem>
                              <SelectItem value={TierType.Customer.toString()}>
                                Customer
                              </SelectItem>
                              <SelectItem value={TierType.Vendor.toString()}>
                                Vendor
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-sm text-blue-300/70 mt-2">
                          Select the tier type for this document type
                        </FormDescription>
                        <FormMessage className="text-sm mt-1 text-red-400" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </MotionDiv>
        );

      case 3: // Type Details
        return (
          <MotionDiv
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <FileText className="mx-auto h-12 w-12 text-blue-500 mb-3 p-2 bg-blue-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">
                  Type Details
                </h3>
                <p className="text-sm text-blue-300/70">
                  Add additional description for this document type
                </p>
              </div>

              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="typeAttr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-blue-100">
                          Type Description (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter description (optional)"
                            className="min-h-[120px] text-sm bg-[#111633] border-blue-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none rounded-md"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-blue-300/70 mt-2">
                          Additional description for this document type
                        </FormDescription>
                        <FormMessage className="text-sm mt-1 text-red-400" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </MotionDiv>
        );

      case 4: // Review
        return (
          <MotionDiv
            key="step4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3 p-2 bg-green-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">
                  Review Details
                </h3>
                <p className="text-sm text-blue-300/70">
                  Confirm the document type details before creating
                </p>
              </div>

              <div className="space-y-4 bg-[#0d1541]/70 p-4 rounded-md border border-blue-900/30">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 text-sm">Type Name</span>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">
                      {form.getValues("typeName")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-blue-900/20 pt-3">
                  <span className="text-blue-300 text-sm">Type Code</span>
                  <div className="mt-1 text-white">
                    <p className="text-sm text-blue-300/50 italic">
                      Will be auto-generated
                    </p>
                  </div>
                </div>

                <div className="border-t border-blue-900/20 pt-3">
                  <span className="text-blue-300 text-sm">Tier Type</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">
                      {(() => {
                        const tierType = form.getValues("tierType") || TierType.None;
                        switch (tierType) {
                          case TierType.Customer:
                            return "Customer";
                          case TierType.Vendor:
                            return "Vendor";
                          default:
                            return "None";
                        }
                      })()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-blue-900/20 pt-3">
                  <span className="text-blue-300 text-sm">Description</span>
                  <div className="mt-1 text-white">
                    {form.getValues("typeAttr") ? (
                      <p className="text-sm">{form.getValues("typeAttr")}</p>
                    ) : (
                      <p className="text-sm text-blue-300/50 italic">
                        No description added
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 p-3 rounded-md mt-4">
                <p className="text-sm text-blue-200">
                  Ready to {isEditMode ? "update" : "create"} this document
                  type. Click "{isEditMode ? "Update" : "Create"} Type" to
                  confirm.
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
    <div className="w-full max-w-2xl mx-auto bg-[#0a1033] rounded-lg shadow-xl overflow-hidden border border-blue-900/30">
      {/* Header */}
      <div className="p-6 pb-4 flex justify-between items-center border-b border-blue-900/30">
        <div className="flex items-center">
          <FileType className="h-6 w-6 text-blue-400 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEditMode ? "Edit Document Type" : "Create Document Type"}
            </h2>
            <p className="text-sm text-blue-300 mt-1">
              {isEditMode
                ? "Update document type details"
                : "Create a new document type for your organization"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="px-6 pt-6 mb-4">
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
                  step.id === currentStep && "text-blue-600 dark:text-blue-500"
                )}
              >
                {step.description}
              </span>
            </div>
          ))}
        </div>

        {/* Progress line */}
        <div className="relative mt-4 mb-6">
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
      <div className="px-6 py-2 min-h-[300px]">
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </div>

      {/* Footer with Navigation Buttons */}
      <div className="p-6 border-t border-blue-900/30 flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
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
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          {currentStep < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={currentStep === 1 && !form.getValues("typeName")}
              className={`${
                currentStep === 1 && !form.getValues("typeName")
                  ? "bg-blue-600/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleReviewSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner mr-2" />{" "}
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {isEditMode ? "Update" : "Create"} Type
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentTypeForm;
