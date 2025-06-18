import { useStepForm } from "./StepFormProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApproverSelector } from "./ApproverSelector";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    requiresApproval: z.boolean(),
    approvalType: z.enum(["user", "group"]).optional().nullable(),
    approvalUserId: z.number().optional().nullable(),
    approvalGroupId: z.number().optional().nullable(),
  })
  .refine(
    (data) => {
      // If approval is required, we need either a user or a group
      if (data.requiresApproval) {
        if (data.approvalType === "user") {
          return !!data.approvalUserId;
        } else if (data.approvalType === "group") {
          return !!data.approvalGroupId;
        }
        return false;
      }
      return true;
    },
    {
      message: "Please select an approver",
      path: ["approvalType"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export const StepOptions = () => {
  const { formData, setFormData, registerStepForm } = useStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Log the initial form data for debugging
  useEffect(() => {
    console.log("StepOptions mounted with formData:", formData);
  }, []);

  // Determine initial approvalType from formData
  const initialApprovalType = formData.approvalUserId
    ? "user"
    : formData.approvalGroupId
    ? "group"
    : null;

  console.log("Initial approval type:", initialApprovalType);
  console.log("Initial approvalUserId:", formData.approvalUserId);
  console.log("Initial approvalGroupId:", formData.approvalGroupId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requiresApproval: formData.requiresApproval || false,
      approvalType: initialApprovalType,
      approvalUserId: formData.approvalUserId || null,
      approvalGroupId: formData.approvalGroupId || null,
    },
    mode: "onChange",
  });

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(3, {
      validate: async () => {
        setValidationError(null);
        const result = await form.trigger();

        if (!result) {
          // Get the first error message to display
          const errors = form.formState.errors;
          if (errors.approvalType) {
            setValidationError(
              errors.approvalType.message || "Please select an approver"
            );
          } else if (errors.approvalUserId) {
            setValidationError(
              errors.approvalUserId.message ||
                "Please select an individual approver"
            );
          } else if (errors.approvalGroupId) {
            setValidationError(
              errors.approvalGroupId.message ||
                "Please select an approval group"
            );
          }
        }

        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form]);

  const handleApprovalTypeChange = (type: "individual" | "group") => {
    const approvalType = type === "individual" ? "user" : "group";
    console.log("Changing approval type to:", approvalType);

    form.setValue("approvalType", approvalType);
    setValidationError(null);

    // Reset the previous values when changing type
    if (type === "individual") {
      form.setValue("approvalGroupId", null);
    } else {
      form.setValue("approvalUserId", null);
    }

    setFormData({
      approvalType,
      approvalUserId:
        type === "individual" ? formData.approvalUserId : undefined,
      approvalGroupId: type === "group" ? formData.approvalGroupId : undefined,
    });
  };

  const onRequiresApprovalChange = (checked: boolean) => {
    console.log("Requires approval changed:", checked);
    form.setValue("requiresApproval", checked);
    setValidationError(null);

    if (!checked) {
      form.setValue("approvalType", null);
      form.setValue("approvalUserId", null);
      form.setValue("approvalGroupId", null);

      // Update form data when turning off approval
      setFormData({
        requiresApproval: checked,
        approvalType: undefined,
        approvalUserId: undefined,
        approvalGroupId: undefined,
      });
    } else {
      // When turning on approval, ensure there's a default approval type
      const currentType = form.getValues("approvalType");
      if (!currentType) {
        form.setValue("approvalType", "user");
        setFormData({
          requiresApproval: checked,
          approvalType: "user",
        });
      } else {
        setFormData({
          requiresApproval: checked,
          approvalType: currentType,
        });
      }
    }
  };

  const onUserSelected = (userId: number | undefined) => {
    console.log("User selected in parent:", userId);
    form.setValue("approvalUserId", userId || null);
    // Use the updated form state to set form data
    setFormData({
      approvalUserId: userId,
      // Explicitly set approvalType to make sure it's updated
      approvalType: "user",
      // Clear any group selection
      approvalGroupId: undefined,
    });
    setValidationError(null);
  };

  const onGroupSelected = (groupId: number | undefined) => {
    console.log("Group selected in parent:", groupId);
    form.setValue("approvalGroupId", groupId || null);
    // Use the updated form state to set form data
    setFormData({
      approvalGroupId: groupId,
      // Explicitly set approvalType to make sure it's updated
      approvalType: "group",
      // Clear any user selection
      approvalUserId: undefined,
    });
    setValidationError(null);
  };

  // Convert approval type from form format to component format
  const getApprovalTypeForComponent = () => {
    const type = form.watch("approvalType");
    console.log("Current approval type:", type);
    return type === "user" ? "individual" : "group";
  };

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md rounded-lg">
      <CardContent className="p-3">
        <Form {...form}>
          <form className="space-y-4">
            <h3 className="text-sm font-medium text-blue-300">Step Options</h3>
            <p className="text-xs text-gray-400 mb-2">
              Configure approval requirements for this step
            </p>

            <div className="flex items-center justify-between bg-[#0d1541]/70 border border-blue-900/30 p-2.5 rounded-md">
              <div className="space-y-1">
                <Label
                  htmlFor="requiresApproval"
                  className="text-xs font-medium text-blue-200 flex items-center"
                >
                  Requires Approval
                </Label>
                <p className="text-xs text-gray-400">
                  Documents must be approved at this step
                </p>
              </div>
              <Switch
                id="requiresApproval"
                checked={form.watch("requiresApproval")}
                onCheckedChange={onRequiresApprovalChange}
              />
            </div>

            {form.watch("requiresApproval") && (
              <div className="space-y-3 bg-[#0d1541]/70 border border-blue-900/30 p-3 rounded-md">
                {isLoading ? (
                  <Skeleton className="h-48 w-full bg-blue-900/20" />
                ) : (
                  <FormField
                    control={form.control}
                    name="approvalType"
                    render={() => (
                      <FormItem>
                        <ApproverSelector
                          selectedUserId={
                            form.watch("approvalUserId") || undefined
                          }
                          selectedGroupId={
                            form.watch("approvalGroupId") || undefined
                          }
                          onUserSelected={onUserSelected}
                          onGroupSelected={onGroupSelected}
                          approvalType={getApprovalTypeForComponent()}
                          onApprovalTypeChange={handleApprovalTypeChange}
                        />

                        {validationError && (
                          <Alert
                            variant="destructive"
                            className="mt-3 py-2 bg-red-900/20 border-red-900/30"
                          >
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-xs text-red-300 ml-2">
                              {validationError}
                            </AlertDescription>
                          </Alert>
                        )}

                        <FormMessage className="text-red-400 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {!form.watch("requiresApproval") && (
              <div className="flex items-center mt-4 p-2 bg-gray-800/50 border border-gray-700 rounded-md">
                <Info className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <p className="text-xs text-gray-300">
                  When approval is not required, documents will automatically
                  progress to the next step.
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
