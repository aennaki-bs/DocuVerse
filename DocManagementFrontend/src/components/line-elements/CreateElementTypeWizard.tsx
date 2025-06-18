import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Loader2,
  Tag,
  Package,
  Calculator,
  FileText,
  Database,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  Item,
  GeneralAccounts,
  CreateLignesElementTypeRequest,
} from "@/models/lineElements";

// Validation schemas for each step
const step1Schema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less"),
});

const step2Schema = z.object({
  tableName: z
    .string()
    .min(1, "Table name is required")
    .max(100, "Table name must be 100 characters or less"),
  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional()
    .transform((val) => val?.trim() || ""),
});

const step3Schema = z.object({
  typeElement: z.enum(["Item", "General Accounts"], {
    required_error: "Please select a type element",
  }),
});

const step4Schema = z.object({
  selectedElementCode: z.string().min(1, "Please select an element"),
});

// Combined schema for final validation
const finalSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less"),
  tableName: z
    .string()
    .min(1, "Table name is required")
    .max(100, "Table name must be 100 characters or less"),
  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional()
    .transform((val) => val?.trim() || ""),
  typeElement: z.enum(["Item", "General Accounts"]),
  selectedElementCode: z.string().min(1, "Please select an element"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type FinalData = z.infer<typeof finalSchema>;

interface CreateElementTypeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableItems: Item[];
  availableGeneralAccounts: GeneralAccounts[];
}

const CreateElementTypeWizard = ({
  open,
  onOpenChange,
  onSuccess,
  availableItems,
  availableGeneralAccounts,
}: CreateElementTypeWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBasicCodeFormat, setHasBasicCodeFormat] = useState(false);

  // Form data for each step
  const [wizardData, setWizardData] = useState<Partial<FinalData>>({});

  // Forms for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { code: "" },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { tableName: "", description: "" },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
  });

  // Reset wizard when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setIsCodeValid(false);
      setIsValidatingCode(false);
      setHasBasicCodeFormat(false);
      setWizardData({});
      step1Form.reset();
      step2Form.reset();
      step3Form.reset();
      step4Form.reset();
    }
  }, [open, step1Form, step2Form, step3Form, step4Form]);

  // Check basic code format (without API call)
  const checkBasicCodeFormat = (code: string) => {
    const isValidFormat = code.trim().length >= 1 && code.trim().length <= 50;
    setHasBasicCodeFormat(isValidFormat);
    return isValidFormat;
  };

  // Validate code uniqueness
  const validateCode = async (code: string) => {
    if (!code.trim()) {
      setIsCodeValid(false);
      return;
    }

    setIsValidatingCode(true);
    try {
      // Check if code already exists in element types
      const existingTypes = await lineElementsService.elementTypes.getAll();
      const codeExists = existingTypes.some(
        (type) => type.code.toLowerCase() === code.toLowerCase()
      );

      if (codeExists) {
        step1Form.setError("code", {
          type: "manual",
          message: "This code already exists. Please choose a different code.",
        });
        setIsCodeValid(false);
      } else {
        step1Form.clearErrors("code");
        setIsCodeValid(true);
      }
    } catch (error) {
      console.error("Error validating code:", error);
      toast.error("Failed to validate code");
      setIsCodeValid(false);
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Handle step navigation
  const handleNextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await step1Form.trigger();
        if (isValid) {
          const code = step1Form.getValues().code;

          // If code hasn't been validated for uniqueness, do it now
          if (!isCodeValid && !isValidatingCode) {
            await validateCode(code);
          }

          // Only proceed if code is unique
          if (isCodeValid) {
            const data = step1Form.getValues();
            setWizardData((prev) => ({ ...prev, ...data }));
            setCurrentStep(2);
          } else {
            toast.error("Please ensure the code is unique before proceeding");
          }
        }
        break;
      case 2:
        isValid = await step2Form.trigger();
        if (isValid) {
          const data = step2Form.getValues();
          setWizardData((prev) => ({ ...prev, ...data }));
          setCurrentStep(3);
        }
        break;
      case 3:
        isValid = await step3Form.trigger();
        if (isValid) {
          const data = step3Form.getValues();
          setWizardData((prev) => ({ ...prev, ...data }));
          setCurrentStep(4);
        }
        break;
      case 4:
        isValid = await step4Form.trigger();
        if (isValid) {
          const data = step4Form.getValues();
          setWizardData((prev) => ({ ...prev, ...data }));
          setCurrentStep(5);
        }
        break;
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit the form
  const handleSubmit = async () => {
    if (
      !wizardData.code ||
      !wizardData.tableName ||
      !wizardData.typeElement ||
      !wizardData.selectedElementCode
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const createRequest: CreateLignesElementTypeRequest = {
        code: wizardData.code,
        typeElement: wizardData.typeElement,
        description:
          wizardData.description && wizardData.description.trim()
            ? wizardData.description.trim()
            : `${wizardData.typeElement} element type for ${wizardData.tableName}`,
        tableName: wizardData.tableName,
        itemCode:
          wizardData.typeElement === "Item"
            ? wizardData.selectedElementCode
            : undefined,
        accountCode:
          wizardData.typeElement === "General Accounts"
            ? wizardData.selectedElementCode
            : undefined,
      };

      await lineElementsService.elementTypes.create(createRequest);
      toast.success("Element type created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create element type:", error);
      toast.error("Failed to create element type");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected element details for review
  const getSelectedElementDetails = () => {
    if (!wizardData.typeElement || !wizardData.selectedElementCode) return null;

    if (wizardData.typeElement === "Item") {
      return availableItems.find(
        (item) => item.code === wizardData.selectedElementCode
      );
    } else {
      return availableGeneralAccounts.find(
        (account) => account.code === wizardData.selectedElementCode
      );
    }
  };

  const steps = [
    { number: 1, title: "Code Validation", icon: Tag },
    { number: 2, title: "Basic Information", icon: FileText },
    { number: 3, title: "Type Selection", icon: Database },
    { number: 4, title: "Element Selection", icon: Package },
    { number: 5, title: "Review & Submit", icon: Eye },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1033] border-blue-900/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white flex items-center">
            <Tag className="mr-3 h-6 w-6 text-blue-400" />
            Create New Element Type
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Follow the steps to create a new line element type with proper
            associations
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep > step.number
                    ? "bg-green-600 border-green-600 text-white"
                    : currentStep === step.number
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-blue-900/50 text-blue-400 bg-[#111633]"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? "text-white" : "text-blue-400"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-4 h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>

        <Separator className="bg-blue-900/30 mb-6" />

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Code Validation */}
          {currentStep === 1 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-blue-400" />
                  Step 1: Unique Code Validation
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Enter a unique code for the element type. This code will be
                  used to identify the element type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step1Form}>
                  <FormField
                    control={step1Form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Element Type Code *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter unique code (e.g., ITEM_OFFICE_001)"
                              {...field}
                              className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 pr-10"
                              onChange={(e) => {
                                field.onChange(e);
                                const value = e.target.value;
                                checkBasicCodeFormat(value);
                                setIsCodeValid(false); // Reset validation state
                              }}
                              onBlur={() => {
                                if (field.value) {
                                  validateCode(field.value);
                                }
                              }}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isValidatingCode && (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                              )}
                              {!isValidatingCode && isCodeValid && (
                                <Check className="h-4 w-4 text-green-400" />
                              )}
                              {!isValidatingCode &&
                                !isCodeValid &&
                                field.value && (
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                        {isCodeValid && (
                          <p className="text-sm text-green-400 flex items-center">
                            <Check className="mr-1 h-3 w-3" />
                            Code is available and valid
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </Form>

                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">
                    Code Guidelines:
                  </h4>
                  <ul className="text-xs text-blue-400 space-y-1">
                    <li>• Use uppercase letters, numbers, and underscores</li>
                    <li>• Make it descriptive and meaningful</li>
                    <li>• Maximum 50 characters</li>
                    <li>• Must be unique across all element types</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-400" />
                  Step 2: Basic Information
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Provide the table name and an optional description for the
                  element type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step2Form}>
                  <FormField
                    control={step2Form.control}
                    name="tableName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Table Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter table name (e.g., Items, Accounts)"
                            {...field}
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step2Form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Description (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a brief description"
                            {...field}
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </Form>

                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-amber-300 mb-2">
                    Information:
                  </h4>
                  <ul className="text-xs text-amber-400 space-y-1">
                    <li>
                      • Table name should match the database table or entity
                    </li>
                    <li>
                      • Description is optional - if left empty, a description
                      will be auto-generated
                    </li>
                    <li>
                      • Auto-generated format: "[Type Element] element type for
                      [Table Name]"
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Type Selection */}
          {currentStep === 3 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="mr-2 h-5 w-5 text-blue-400" />
                  Step 3: Type Element Selection
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Choose whether this element type will reference Items or
                  General Accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step3Form}>
                  <FormField
                    control={step3Form.control}
                    name="typeElement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Type Element *
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <Card
                              className={`cursor-pointer transition-all border-2 ${
                                field.value === "Item"
                                  ? "border-emerald-500 bg-emerald-900/20"
                                  : "border-blue-900/30 bg-[#111633] hover:border-blue-700/50"
                              }`}
                              onClick={() => field.onChange("Item")}
                            >
                              <CardContent className="p-4 text-center">
                                <Package
                                  className={`h-8 w-8 mx-auto mb-2 ${
                                    field.value === "Item"
                                      ? "text-emerald-400"
                                      : "text-blue-400"
                                  }`}
                                />
                                <h3 className="font-medium text-white">
                                  Items
                                </h3>
                                <p className="text-xs text-blue-300 mt-1">
                                  Physical items and products
                                </p>
                                {field.value === "Item" && (
                                  <Check className="h-4 w-4 text-emerald-400 mx-auto mt-2" />
                                )}
                              </CardContent>
                            </Card>

                            <Card
                              className={`cursor-pointer transition-all border-2 ${
                                field.value === "General Accounts"
                                  ? "border-violet-500 bg-violet-900/20"
                                  : "border-blue-900/30 bg-[#111633] hover:border-blue-700/50"
                              }`}
                              onClick={() => field.onChange("General Accounts")}
                            >
                              <CardContent className="p-4 text-center">
                                <Calculator
                                  className={`h-8 w-8 mx-auto mb-2 ${
                                    field.value === "General Accounts"
                                      ? "text-violet-400"
                                      : "text-blue-400"
                                  }`}
                                />
                                <h3 className="font-medium text-white">
                                  General Accounts
                                </h3>
                                <p className="text-xs text-blue-300 mt-1">
                                  Accounting codes and accounts
                                </p>
                                {field.value === "General Accounts" && (
                                  <Check className="h-4 w-4 text-violet-400 mx-auto mt-2" />
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Element Selection */}
          {currentStep === 4 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-400" />
                  Step 4: Select Specific Element
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Choose the specific {wizardData.typeElement?.toLowerCase()}{" "}
                  that this element type will reference.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step4Form}>
                  <FormField
                    control={step4Form.control}
                    name="selectedElementCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Select {wizardData.typeElement} *
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                              <SelectValue
                                placeholder={`Select a ${wizardData.typeElement?.toLowerCase()}`}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111633] border-blue-900/50 max-h-64">
                              {wizardData.typeElement === "Item"
                                ? availableItems.map((item) => (
                                    <SelectItem
                                      key={`wizard-item-${item.id}`}
                                      value={item.code}
                                    >
                                      <div className="flex items-center">
                                        <Package className="h-4 w-4 mr-2 text-emerald-400" />
                                        <span>
                                          {item.code} - {item.description}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                : availableGeneralAccounts.map((account) => (
                                    <SelectItem
                                      key={`wizard-account-${account.id}`}
                                      value={account.code}
                                    >
                                      <div className="flex items-center">
                                        <Calculator className="h-4 w-4 mr-2 text-violet-400" />
                                        <span>
                                          {account.code} - {account.description}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </Form>

                {wizardData.typeElement && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">
                      Available {wizardData.typeElement}:
                    </h4>
                    <p className="text-xs text-blue-400">
                      {wizardData.typeElement === "Item"
                        ? `${availableItems.length} items available`
                        : `${availableGeneralAccounts.length} general accounts available`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-400" />
                  Step 5: Review & Submit
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Review the information and submit to create the element type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-blue-300 text-sm">Code</Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <p className="text-white font-mono">
                          {wizardData.code}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-blue-300 text-sm">
                        Table Name
                      </Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <p className="text-white">{wizardData.tableName}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-blue-300 text-sm">
                        Description
                      </Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <p className="text-white">
                          {wizardData.description &&
                          wizardData.description.trim()
                            ? wizardData.description
                            : `${wizardData.typeElement} element type for ${wizardData.tableName}`}
                        </p>
                        {(!wizardData.description ||
                          !wizardData.description.trim()) && (
                          <p className="text-xs text-amber-400 mt-1">
                            * Auto-generated description (no custom description
                            provided)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-blue-300 text-sm">
                        Type Element
                      </Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <Badge
                          className={`${
                            wizardData.typeElement === "Item"
                              ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                              : "bg-violet-900/30 text-violet-300 border-violet-500/30"
                          }`}
                        >
                          {wizardData.typeElement === "Item" ? (
                            <Package className="h-3 w-3 mr-1" />
                          ) : (
                            <Calculator className="h-3 w-3 mr-1" />
                          )}
                          {wizardData.typeElement}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-blue-300 text-sm">
                        Selected Element
                      </Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        {(() => {
                          const element = getSelectedElementDetails();
                          return element ? (
                            <div>
                              <p className="text-white font-medium">
                                {element.code}
                              </p>
                              <p className="text-blue-300 text-sm">
                                {element.description}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400">No element selected</p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-blue-900/30" />

                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-300 mb-2 flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Ready to Submit
                  </h4>
                  <p className="text-xs text-green-400">
                    All required information has been provided. Click "Create
                    Element Type" to submit.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog Footer with Navigation */}
        <DialogFooter className="flex justify-between items-center pt-6 border-t border-blue-900/30">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
            >
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="text-sm text-blue-400">
            Step {currentStep} of {steps.length}
          </div>

          <div>
            {currentStep < 5 ? (
              <Button
                onClick={handleNextStep}
                disabled={currentStep === 1 && !hasBasicCodeFormat}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Element Type
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateElementTypeWizard;
