import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { SubType } from "@/models/subtype";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import { SubTypeFormProvider } from "@/components/sub-types/components/SubTypeFormProvider";
import { MultiStepSubTypeForm } from "@/components/sub-types/components/MultiStepSubTypeForm";

interface SubTypeDialogsProps {
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  selectedSubType: SubType | null;
  documentTypeId: number;
  onCreateSubmit: (data: any) => void;
  onEditSubmit: (id: number, data: any) => void;
  onDeleteConfirm: (id: number) => void;
}

export default function SubTypeDialogs({
  createDialogOpen,
  setCreateDialogOpen,
  editDialogOpen,
  setEditDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  selectedSubType,
  documentTypeId,
  onCreateSubmit,
  onEditSubmit,
  onDeleteConfirm,
}: SubTypeDialogsProps) {
  const [newSubType, setNewSubType] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
    isActive: true,
  });

  const [editedSubType, setEditedSubType] = useState({
    name: "",
    description: "",
    subTypeKey: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string>("");

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateValue: Date | string) => {
    if (!dateValue) return "";

    try {
      // Create a new Date object from the input
      const date = new Date(dateValue);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateValue);
        return "";
      }

      // Format as YYYY-MM-DD for input[type="date"]
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", dateValue, error);
      return "";
    }
  };

  useEffect(() => {
    if (selectedSubType) {
      setEditedSubType({
        name: selectedSubType.name,
        description: selectedSubType.description,
        subTypeKey: selectedSubType.subTypeKey,
        startDate: formatDateForInput(selectedSubType.startDate),
        endDate: formatDateForInput(selectedSubType.endDate),
        isActive: selectedSubType.isActive,
      });
      // Clear any previous errors when opening edit dialog
      setFieldErrors({});
      setSubmitError("");
    }
  }, [selectedSubType]);

  const handleCreateSubmit = (formData: any) => {
    // Ensure dates are set if they're not already
    if (!formData.startDate) {
      formData.startDate = new Date().toISOString().split("T")[0];
    }

    if (!formData.endDate) {
      formData.endDate = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0];
    }

    // Always set isActive to true if it's undefined
    if (formData.isActive === undefined) {
      formData.isActive = true;
    }

    // Add the document type ID to the form data
    // Map the name field (prefix) to subTypeKey for the backend
    onCreateSubmit({
      ...formData,
      documentTypeId: documentTypeId,
      subTypeKey: formData.name || "", // Map the prefix to subTypeKey field
    });
  };

  const handleEditSubmit = () => {
    if (!selectedSubType) return;

    // Clear previous errors
    setFieldErrors({});
    setSubmitError("");

    // Comprehensive validation
    const errors: string[] = [];
    const newFieldErrors: { [key: string]: string } = {};

    if (!editedSubType.subTypeKey?.trim()) {
      errors.push("Code is required");
      newFieldErrors.subTypeKey = "Code is required";
    } else if (!/^[A-Z0-9-]+$/i.test(editedSubType.subTypeKey)) {
      errors.push("Code can only contain letters, numbers, and hyphens");
      newFieldErrors.subTypeKey =
        "Code can only contain letters, numbers, and hyphens";
    }

    if (!editedSubType.startDate) {
      errors.push("Start date is required");
      newFieldErrors.startDate = "Start date is required";
    }

    if (!editedSubType.endDate) {
      errors.push("End date is required");
      newFieldErrors.endDate = "End date is required";
    }

    if (editedSubType.startDate && editedSubType.endDate) {
      const startDate = new Date(editedSubType.startDate);
      const endDate = new Date(editedSubType.endDate);

      // Check if dates are valid
      if (isNaN(startDate.getTime())) {
        errors.push("Start date is invalid");
        newFieldErrors.startDate = "Invalid date format";
      }

      if (isNaN(endDate.getTime())) {
        errors.push("End date is invalid");
        newFieldErrors.endDate = "Invalid date format";
      }

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (startDate >= endDate) {
          errors.push("Start date must be before end date");
          newFieldErrors.startDate = "Must be before end date";
          newFieldErrors.endDate = "Must be after start date";
        }

        // Check if start date is not too far in the past
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (startDate < oneYearAgo) {
          errors.push("Start date cannot be more than one year in the past");
          newFieldErrors.startDate = "Cannot be more than one year in the past";
        }

        // Check if end date is not too far in the future
        const tenYearsFromNow = new Date();
        tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
        if (endDate > tenYearsFromNow) {
          errors.push("End date cannot be more than 10 years in the future");
          newFieldErrors.endDate = "Cannot be more than 10 years in the future";
        }
      }
    }

    if (errors.length > 0) {
      setFieldErrors(newFieldErrors);
      setSubmitError("Please fix the validation errors above and try again.");
      return;
    }

    // Send the correct fields to the backend including subTypeKey
    const submitData = async () => {
      try {
        await onEditSubmit(selectedSubType.id, {
          name: selectedSubType.name, // Keep original name
          subTypeKey: editedSubType.subTypeKey.trim(),
          description: selectedSubType.description || "", // Keep original description
          startDate: editedSubType.startDate,
          endDate: editedSubType.endDate,
          isActive: editedSubType.isActive,
        });
      } catch (error) {
        console.error("Error submitting edit:", error);
        if (error instanceof Error) {
          setSubmitError(error.message);
        } else {
          setSubmitError("An unknown error occurred while saving changes");
        }
      }
    };

    submitData();
  };

  const resetCreateForm = () => {
    setNewSubType({
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      isActive: true,
    });
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    resetCreateForm();
  };

  return (
    <>
      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[500px] min-h-[650px] max-h-[90vh] p-3 overflow-auto fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <DialogHeader className="mb-1 pb-1 border-b border-blue-900/30">
            <DialogTitle className="text-lg text-white">
              Create New Series
            </DialogTitle>
            <DialogDescription className="text-blue-300 text-xs">
              Complete each step to create a new document series
            </DialogDescription>
          </DialogHeader>

          <div className="py-1 h-full overflow-y-auto">
            <SubTypeFormProvider
              onSubmit={handleCreateSubmit}
              onClose={handleCloseCreateDialog}
              initialData={{ documentTypeId: documentTypeId }}
            >
              <MultiStepSubTypeForm onCancel={handleCloseCreateDialog} />
            </SubTypeFormProvider>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[425px] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-blue-900/30 bg-[#0a1033]/50">
            <DialogTitle className="text-lg font-medium text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              Edit Series
            </DialogTitle>
          </DialogHeader>

          {/* Error Card */}
          {submitError && (
            <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400 mt-0.5 flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" x2="9" y1="9" y2="15" />
                  <line x1="9" x2="15" y1="9" y2="15" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-medium">Error</p>
                  <p className="text-red-300 text-sm mt-1">{submitError}</p>
                </div>
                <button
                  onClick={() => setSubmitError("")}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Date Range Fields */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-blue-300">
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div className="relative flex items-center">
                  <div className="absolute left-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400/70"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editedSubType.startDate}
                    onChange={(e) => {
                      setEditedSubType({
                        ...editedSubType,
                        startDate: e.target.value,
                      });
                      // Clear errors when user starts typing
                      if (fieldErrors.startDate) {
                        setFieldErrors((prev) => ({ ...prev, startDate: "" }));
                      }
                      if (submitError) {
                        setSubmitError("");
                      }
                    }}
                    className={`h-9 w-full pl-9 bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154] ${
                      fieldErrors.startDate
                        ? "border-red-500 focus:border-red-400"
                        : ""
                    }`}
                  />
                  {fieldErrors.startDate && (
                    <p className="text-red-400 text-xs mt-1">
                      {fieldErrors.startDate}
                    </p>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400/70"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editedSubType.endDate}
                    onChange={(e) => {
                      setEditedSubType({
                        ...editedSubType,
                        endDate: e.target.value,
                      });
                      // Clear errors when user starts typing
                      if (fieldErrors.endDate) {
                        setFieldErrors((prev) => ({ ...prev, endDate: "" }));
                      }
                      if (submitError) {
                        setSubmitError("");
                      }
                    }}
                    className={`h-9 w-full pl-9 bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154] ${
                      fieldErrors.endDate
                        ? "border-red-500 focus:border-red-400"
                        : ""
                    }`}
                  />
                  {fieldErrors.endDate && (
                    <p className="text-red-400 text-xs mt-1">
                      {fieldErrors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Code Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-code"
                className="text-sm font-medium text-blue-300"
              >
                Code
              </Label>
              <Input
                id="edit-code"
                placeholder="Enter series code"
                value={editedSubType.subTypeKey}
                onChange={(e) => {
                  setEditedSubType({
                    ...editedSubType,
                    subTypeKey: e.target.value,
                  });
                  // Clear errors when user starts typing
                  if (fieldErrors.subTypeKey) {
                    setFieldErrors((prev) => ({ ...prev, subTypeKey: "" }));
                  }
                  if (submitError) {
                    setSubmitError("");
                  }
                }}
                className={`h-9 w-full bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154] ${
                  fieldErrors.subTypeKey
                    ? "border-red-500 focus:border-red-400"
                    : ""
                }`}
              />
              {fieldErrors.subTypeKey && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.subTypeKey}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between py-1">
              <Label
                htmlFor="edit-active"
                className="text-sm font-medium text-blue-300"
              >
                Status
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editedSubType.isActive}
                  onCheckedChange={(checked) =>
                    setEditedSubType({ ...editedSubType, isActive: checked })
                  }
                  className="data-[state=checked]:bg-blue-500 h-5 w-9"
                />
                <span className="text-xs text-blue-300/90">
                  {editedSubType.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-blue-900/30 bg-[#0a1033]/50 flex-row space-x-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="flex-1 h-9 border-blue-800/40 text-blue-300 hover:bg-blue-900/20 hover:text-blue-200 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="flex-1 h-9 bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0f1642] border-blue-900/50 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-white">
              Are you sure you want to delete the series "
              {selectedSubType?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300/90 mt-2">
              Are you sure you want to delete the series "
              <span className="text-white font-medium">
                {selectedSubType?.name}
              </span>
              "?
              <div className="mt-2 text-red-300/90">
                This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-blue-900/30 mt-4 pt-4 flex space-x-2">
            <AlertDialogCancel className="bg-transparent flex-1 hover:bg-blue-900/20 border-blue-900/50 text-blue-300 hover:text-white transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedSubType && onDeleteConfirm(selectedSubType.id)
              }
              className="bg-red-600 flex-1 hover:bg-red-700 text-white transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
