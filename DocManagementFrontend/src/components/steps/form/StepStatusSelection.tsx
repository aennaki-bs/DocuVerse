import { useEffect, useState, useCallback } from "react";
import { useStepForm } from "./StepFormProvider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, RefreshCw } from "lucide-react";
import api from "@/services/api/core";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import stepService from "@/services/stepService";
import { Badge } from "@/components/ui/badge";

// Define the status interface
interface Status {
  statusId: number;
  statusKey: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isInitial: boolean;
  isFinal: boolean;
  isFlexible: boolean;
  circuitId: number;
  transitionInfo?: string;
}

const formSchema = z.object({
  currentStatusId: z.string().min(1, "Current status is required"),
  nextStatusId: z.string().min(1, "Next status is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const StepStatusSelection = () => {
  const { formData, setFormData, registerStepForm, isEditMode, editStep } = useStepForm();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [nextStatusOptions, setNextStatusOptions] = useState<Status[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentStatusId: formData.currentStatusId?.toString() || "",
      nextStatusId: formData.nextStatusId?.toString() || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Define fetchStatuses with useCallback to avoid dependency cycle
  const fetchStatuses = useCallback(async () => {
    if (!formData.circuitId) return;

    setIsLoadingStatuses(true);
    setFetchError(null);

    try {
      // Use the correct API endpoint for fetching statuses - remove duplicate /api prefix
      const response = await api.get(`/Circuit/${formData.circuitId}/statuses`);

      if (response.data && Array.isArray(response.data)) {
        setStatuses(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        setFetchError("Received invalid status data from server");
      }
    } catch (error: any) {
      console.error("Error fetching statuses:", error);
      // More detailed error message
      const errorMessage =
        error?.response?.status === 404
          ? "Status data not found for this circuit."
          : "Failed to load statuses. Please try again.";
      setFetchError(errorMessage);
    } finally {
      setIsLoadingStatuses(false);
    }
  }, [formData.circuitId]);

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(2, {
      validate: async () => {
        const result = await form.trigger();

        // If form is valid, check for duplicate steps
        if (result && formData.currentStatusId && formData.nextStatusId) {
          setIsCheckingDuplicate(true);
          try {
            if (isEditMode) {
              // In edit mode, get all steps and check manually excluding the current step
              const stepsResponse = await api.get(`/Circuit/${formData.circuitId}`);
              const circuitData = stepsResponse.data;
              
              if (circuitData && circuitData.steps) {
                const conflictingStep = circuitData.steps.find((step: any) => 
                  step.id !== editStep?.id && // Exclude the current step being edited
                  step.currentStatusId === formData.currentStatusId &&
                  step.nextStatusId === formData.nextStatusId
                );
                
                if (conflictingStep) {
                  form.setError("nextStatusId", {
                    type: "manual",
                    message: "A step with these status transitions already exists",
                  });
                  setIsCheckingDuplicate(false);
                  return false;
                }
              }
            } else {
              // For new steps, use the existing service function
              const exists = await stepService.checkStepExists(
                formData.circuitId,
                formData.currentStatusId,
                formData.nextStatusId
              );

              if (exists) {
                form.setError("nextStatusId", {
                  type: "manual",
                  message: "A step with these status transitions already exists",
                });
                setIsCheckingDuplicate(false);
                return false;
              }
            }
          } catch (error) {
            console.error("Error checking step existence:", error);
          }
          setIsCheckingDuplicate(false);
        }

        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form, formData, isEditMode]);

  // Fetch statuses when component mounts or circuitId changes
  useEffect(() => {
    if (formData.circuitId) {
      fetchStatuses();
    }
  }, [formData.circuitId, fetchStatuses]);

  // Update next status options when current status changes
  useEffect(() => {
    if (formData.currentStatusId) {
      // Filter out the current status from next status options
      const filteredStatuses = statuses.filter(
        (status) => status.statusId !== formData.currentStatusId
      );
      setNextStatusOptions(filteredStatuses);
    } else {
      setNextStatusOptions([]);
    }
  }, [formData.currentStatusId, statuses]);

  const handleCurrentStatusChange = (value: string) => {
    form.setValue("currentStatusId", value);
    setFormData({ currentStatusId: parseInt(value, 10) });

    // Clear next status when current status changes
    form.setValue("nextStatusId", "");
    setFormData({ nextStatusId: undefined });
  };

  const handleNextStatusChange = (value: string) => {
    form.setValue("nextStatusId", value);
    setFormData({ nextStatusId: parseInt(value, 10) });
  };

  const getStatusById = (statusId?: number): Status | undefined => {
    if (!statusId) return undefined;
    return statuses.find((status) => status.statusId === statusId);
  };

  // Render status badges for initial/final states
  const renderStatusBadges = (status?: Status) => {
    if (!status) return null;

    return (
      <div className="flex gap-1.5 mt-1">
        {status.isInitial && (
          <Badge variant="success" size="sm" className="px-1.5 py-0.5">
            Initial
          </Badge>
        )}
        {status.isFinal && (
          <Badge variant="destructive" size="sm" className="px-1.5 py-0.5">
            Final
          </Badge>
        )}
        {status.isRequired && !status.isInitial && !status.isFinal && (
          <Badge variant="secondary" size="sm" className="px-1.5 py-0.5">
            Required
          </Badge>
        )}
      </div>
    );
  };

  const renderStatusItem = (status: Status) => (
    <SelectItem
      key={status.statusId}
      value={status.statusId.toString()}
      className="text-xs py-2"
    >
      <div>
        <div className="flex items-center">
          <span>{status.title}</span>
          {status.isInitial && (
            <span className="ml-1.5 text-[10px] bg-green-900/30 text-green-400 px-1 py-0.5 rounded">
              Initial
            </span>
          )}
          {status.isFinal && (
            <span className="ml-1.5 text-[10px] bg-red-900/30 text-red-400 px-1 py-0.5 rounded">
              Final
            </span>
          )}
        </div>
        {status.description && (
          <div className="text-[10px] text-blue-300/70 mt-0.5">
            {status.description}
          </div>
        )}
      </div>
    </SelectItem>
  );

  if (fetchError) {
    return (
      <Card className="border border-red-900/30 bg-gradient-to-b from-[#330a0a] to-[#41150d] shadow-md rounded-lg">
        <CardContent className="p-3">
          <div className="p-4 text-center">
            <p className="text-red-300 mb-2">{fetchError}</p>
            <button
              className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 rounded text-blue-300 text-sm flex items-center justify-center mx-auto"
              onClick={fetchStatuses}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md rounded-lg">
      <CardContent className="p-3">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="currentStatusId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-300 text-xs font-medium">
                    Current Status
                  </FormLabel>
                  <Select
                    onValueChange={handleCurrentStatusChange}
                    value={field.value}
                    disabled={isLoadingStatuses}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md h-8 text-xs">
                        <SelectValue placeholder="Select current status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0d1541] border-blue-900/50 text-white max-h-[300px]">
                      {isLoadingStatuses ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                          <span className="text-xs">Loading statuses...</span>
                        </div>
                      ) : statuses.length === 0 ? (
                        <div className="p-2 text-center text-xs text-blue-300/70">
                          No statuses available for this circuit
                        </div>
                      ) : (
                        statuses.map(renderStatusItem)
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center py-1">
              <ArrowRight className="h-4 w-4 text-blue-500" />
            </div>

            <FormField
              control={form.control}
              name="nextStatusId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-300 text-xs font-medium">
                    Next Status
                  </FormLabel>
                  <Select
                    onValueChange={handleNextStatusChange}
                    value={field.value}
                    disabled={
                      isLoadingStatuses ||
                      !formData.currentStatusId ||
                      isCheckingDuplicate
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md h-8 text-xs">
                        <SelectValue placeholder="Select next status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#0d1541] border-blue-900/50 text-white max-h-[300px]">
                      {isLoadingStatuses || !formData.currentStatusId ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                          <span className="text-xs">
                            {isLoadingStatuses
                              ? "Loading statuses..."
                              : "Select current status first"}
                          </span>
                        </div>
                      ) : nextStatusOptions.length === 0 ? (
                        <div className="p-2 text-center text-xs text-blue-300/70">
                          No available next statuses
                        </div>
                      ) : (
                        nextStatusOptions.map(renderStatusItem)
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {isCheckingDuplicate && (
              <div className="flex items-center justify-center text-xs text-blue-400">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Checking for duplicate steps...
              </div>
            )}

            {/* Status transition visualization */}
            {formData.currentStatusId && formData.nextStatusId && (
              <div className="mt-3 p-2 bg-blue-900/20 border border-blue-900/30 rounded-md">
                <Label className="text-xs text-gray-400 mb-1 block">
                  Status Transition:
                </Label>
                <div className="flex items-center justify-between text-xs">
                  <div className="px-2 py-1 bg-blue-900/30 rounded text-blue-300 flex-1">
                    <div className="truncate">
                      {getStatusById(formData.currentStatusId)?.title ||
                        "Current"}
                    </div>
                    {renderStatusBadges(
                      getStatusById(formData.currentStatusId)
                    )}
                  </div>
                  <ArrowRight className="h-3 w-3 text-blue-500 mx-2 flex-shrink-0" />
                  <div className="px-2 py-1 bg-blue-900/30 rounded text-blue-300 flex-1">
                    <div className="truncate">
                      {getStatusById(formData.nextStatusId)?.title || "Next"}
                    </div>
                    {renderStatusBadges(getStatusById(formData.nextStatusId))}
                  </div>
                </div>
                {getStatusById(formData.currentStatusId)?.description ||
                getStatusById(formData.nextStatusId)?.description ? (
                  <div className="mt-2 text-xs text-gray-400">
                    {getStatusById(formData.currentStatusId)?.description && (
                      <div className="mb-1">
                        <span className="text-blue-400">Current: </span>
                        {getStatusById(formData.currentStatusId)?.description}
                      </div>
                    )}
                    {getStatusById(formData.nextStatusId)?.description && (
                      <div>
                        <span className="text-blue-400">Next: </span>
                        {getStatusById(formData.nextStatusId)?.description}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
