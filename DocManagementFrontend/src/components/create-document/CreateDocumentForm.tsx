import React, { useState } from "react";
import { StepIndicator } from "./steps/StepIndicator";
import { StepNavigation } from "./StepNavigation";
import { DateSelectionStep } from "./steps/DateSelectionStep";
import { TypeSubTypeSelectionWithDateFilter } from "./steps/TypeSubTypeSelectionWithDateFilter";
import { DocumentInfoStep } from "./steps/DocumentInfoStep";
import { CircuitSelectionStep } from "./steps/CircuitSelectionStep";
import { ReviewStep } from "./steps/DocumentReviewStep";
import documentService from "@/services/documentService";
import { toast } from "sonner";
import { CreateDocumentRequest, DocumentType } from "@/models/document";
import { useNavigate } from "react-router-dom";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import { motion, AnimatePresence } from "framer-motion";

interface CreateDocumentFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export const CreateDocumentForm: React.FC<CreateDocumentFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateDocumentRequest>({
    title: "",
    typeId: 0,
    subTypeId: null,
    documentAlias: "",
    documentExterne: "",
    docDate: new Date().toISOString(),
    comptableDate: new Date().toISOString(),
    circuitId: 0,
  });

  // Circuit assignment comments (separate from main form data)
  const [circuitComments, setCircuitComments] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({
    docDate: "",
    comptableDate: "",
    typeId: "",
    subTypeId: "",
    title: "",
    documentExterne: "",
    circuitId: "",
  });

  // External document flag
  const [isExternalDocument, setIsExternalDocument] = useState(false);

  // Fetch document types
  const { filteredAndSortedTypes, isLoading: isLoadingTypes } =
    useDocumentTypes();

  // Handle next step
  const handleNextStep = () => {
    let isValid = true;

    // Validation based on current step
    if (currentStep === 1) {
      if (!formData.docDate) {
        setErrors((prev) => ({
          ...prev,
          docDate: "Document date is required",
        }));
        isValid = false;
      }
      if (!formData.comptableDate) {
        setErrors((prev) => ({
          ...prev,
          comptableDate: "Accounting date is required",
        }));
        isValid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.typeId) {
        setErrors((prev) => ({ ...prev, typeId: "Document type is required" }));
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.title.trim()) {
        setErrors((prev) => ({ ...prev, title: "Title is required" }));
        isValid = false;
      }
      if (isExternalDocument && !formData.documentExterne.trim()) {
        setErrors((prev) => ({
          ...prev,
          documentExterne: "External document reference is required",
        }));
        isValid = false;
      }
    }
    // Circuit selection (step 4) has no mandatory fields

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Ensure content is never undefined by providing an empty string
      await documentService.createDocument({
        ...formData,
        content: "",
      });
      toast.success("Document created successfully");

      // Reset form state after successful submission
      setFormData({
        title: "",
        typeId: 0,
        subTypeId: null,
        documentAlias: "",
        documentExterne: "",
        docDate: new Date().toISOString(),
        comptableDate: new Date().toISOString(),
        circuitId: 0,
      });
      setCircuitComments("");
      setErrors({
        docDate: "",
        comptableDate: "",
        typeId: "",
        subTypeId: "",
        title: "",
        documentExterne: "",
        circuitId: "",
      });
      setIsExternalDocument(false);
      setCurrentStep(1);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/documents");
      }
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const updateFormData = (field: keyof CreateDocumentRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Handle circuit change
  const handleCircuitChange = (circuitId: number | null) => {
    updateFormData("circuitId", circuitId || 0);
  };

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <div className="space-y-4">
              <DateSelectionStep
                docDate={formData.docDate}
                comptableDate={formData.comptableDate || ""}
                docDateError={errors.docDate}
                comptableDateError={errors.comptableDate}
                onDocDateChange={(date) =>
                  updateFormData("docDate", date ? date.toISOString() : "")
                }
                onComptableDateChange={(date) =>
                  updateFormData(
                    "comptableDate",
                    date ? date.toISOString() : ""
                  )
                }
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <TypeSubTypeSelectionWithDateFilter
                documentTypes={filteredAndSortedTypes || []}
                selectedTypeId={formData.typeId || null}
                selectedSubTypeId={formData.subTypeId || null}
                onTypeChange={(id) => updateFormData("typeId", parseInt(id))}
                onSubTypeChange={(id) =>
                  updateFormData("subTypeId", id ? parseInt(id) : null)
                }
                typeError={errors.typeId}
                subTypeError={errors.subTypeId}
                isLoadingTypes={isLoadingTypes}
                documentDate={formData.docDate}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <DocumentInfoStep
                title={formData.title}
                isExternalDocument={isExternalDocument}
                documentExterne={formData.documentExterne || ""}
                onTitleChange={(value) => updateFormData("title", value)}
                onExternalDocumentChange={(value) =>
                  updateFormData("documentExterne", value)
                }
                onToggleExternalDocument={(value) =>
                  setIsExternalDocument(value)
                }
                errors={errors}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <CircuitSelectionStep
                selectedCircuitId={formData.circuitId || null}
                onCircuitChange={handleCircuitChange}
                comments={circuitComments}
                onCommentsChange={setCircuitComments}
                circuitError={errors.circuitId}
              />
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <ReviewStep
                formData={{
                  ...formData,
                  content: "", // Pass empty content to ReviewStep
                }}
                documentTypes={filteredAndSortedTypes || []}
                subTypes={[]} // We don't need to pass subTypes here
                isExternalDocument={isExternalDocument}
                circuitComments={circuitComments}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <StepNavigation
        step={currentStep}
        totalSteps={totalSteps}
        isSubmitting={isSubmitting}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};
