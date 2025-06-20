import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Archive, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Document,
  DocumentType,
  UpdateDocumentRequest,
} from "@/models/document";

interface DocumentEditFormProps {
  document: Document | null;
  documentTypes: DocumentType[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (documentData: UpdateDocumentRequest) => Promise<void>;
  onCancel: () => void;
}

const DocumentEditForm = ({
  document,
  documentTypes,
  isLoading,
  isSubmitting,
  onSubmit,
  onCancel,
}: DocumentEditFormProps) => {
  // Form data
  const [title, setTitle] = useState("");
  const [accountingDate, setAccountingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [content, setContent] = useState("");
  const [documentExterne, setDocumentExterne] = useState("");

  // Track which fields have been edited
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({
    title: false,
    accountingDate: false,
    content: false,
    documentExterne: false,
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      // Set accounting date from the document's comptableDate
      console.log("Document comptableDate:", document.comptableDate);
      // Parse the date and format it for the input field
      const date = new Date(document.comptableDate);
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      console.log("Formatted accounting date for input:", formattedDate);
      setAccountingDate(formattedDate);
      setContent(document.content);
      setDocumentExterne(document.documentExterne || "");

      // Reset edited fields when document changes
      setEditedFields({
        title: false,
        accountingDate: false,
        content: false,
        documentExterne: false,
      });
    }
  }, [document]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTitle(newValue);
    setEditedFields({ ...editedFields, title: newValue !== document?.title });
  };

  const handleAccountingDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setAccountingDate(newValue);

    // Format original date the same way for comparison
    let originalDate = "";
    if (document?.comptableDate) {
      const date = new Date(document.comptableDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      originalDate = `${year}-${month}-${day}`;
    }

    console.log("Comparing dates - new:", newValue, "original:", originalDate);
    setEditedFields({
      ...editedFields,
      accountingDate: newValue !== originalDate,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    setEditedFields({
      ...editedFields,
      content: newValue !== document?.content,
    });
  };

  const handleDocumentExterneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setDocumentExterne(newValue);
    setEditedFields({
      ...editedFields,
      documentExterne: newValue !== document?.documentExterne,
    });
  };

  const validateForm = () => {
    if (!Object.values(editedFields).some((edited) => edited)) {
      toast.info("No changes detected");
      return false;
    }

    if (editedFields.title && !title.trim()) {
      toast.error("Please enter a document title");
      return false;
    }
    if (editedFields.accountingDate && !accountingDate) {
      toast.error("Please select an accounting date");
      return false;
    }
    if (editedFields.content && !content.trim()) {
      toast.error("Please enter document content");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Only include fields that have been edited
    const documentData: UpdateDocumentRequest = {};

    if (editedFields.title) documentData.title = title;
    if (editedFields.accountingDate) {
      // Convert the date string to ISO format for the backend
      // Create date at noon UTC to avoid timezone issues
      const dateToSend = new Date(
        accountingDate + "T12:00:00.000Z"
      ).toISOString();
      console.log(
        "Sending accounting date:",
        accountingDate,
        "as ISO:",
        dateToSend
      );
      documentData.comptableDate = dateToSend;
    }
    if (editedFields.content) documentData.content = content;
    if (editedFields.documentExterne)
      documentData.documentExterne = documentExterne;

    console.log("Submitting document data:", documentData);
    await onSubmit(documentData);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse bg-[#0a1033] border border-blue-900/30">
        <CardContent className="p-6 space-y-6">
          <div className="h-12 bg-[#111633] rounded"></div>
          <div className="h-12 bg-[#111633] rounded"></div>
          <div className="h-12 bg-[#111633] rounded"></div>
          <div className="h-40 bg-[#111633] rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!document) {
    return (
      <Card className="bg-[#0a1033] border border-blue-900/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-gray-400">
            Document not found or you don't have permission to edit it.
          </p>
          <Button
            onClick={onCancel}
            className="mt-4"
            variant="outline"
            size="lg"
          >
            Back to Documents
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isArchived = !!document.erpDocumentCode;

  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          Edit Document Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isArchived && (
          <Alert className="mb-6 bg-orange-900/20 border-orange-700/30 text-orange-200">
            <Archive className="h-4 w-4" />
            <AlertDescription>
              This document has been archived to the ERP system (Code: {document.erpDocumentCode}) and cannot be modified.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="title"
              className="text-base font-medium text-blue-100"
            >
              Document Title*
            </Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter document title"
              className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.title && (
              <p className="text-xs text-blue-400">
                ℹ️ Title has been modified
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="accountingDate"
              className="text-base font-medium text-blue-100"
            >
              Accounting Date*
            </Label>
            <Input
              id="accountingDate"
              type="date"
              value={accountingDate}
              onChange={handleAccountingDateChange}
              className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.accountingDate && (
              <p className="text-xs text-blue-400">
                ℹ️ Accounting date has been modified
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="content"
              className="text-base font-medium text-blue-100"
            >
              Document Content*
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Enter document content"
              rows={10}
              className="text-base resize-y bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.content && (
              <p className="text-xs text-blue-400">
                ℹ️ Content has been modified
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="documentExterne"
              className="text-base font-medium text-blue-100"
            >
              Document Externe
            </Label>
            <Input
              id="documentExterne"
              value={documentExterne}
              onChange={handleDocumentExterneChange}
              placeholder="Enter document externe"
              className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.documentExterne && (
              <p className="text-xs text-blue-400">
                ℹ️ Document externe has been modified
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="px-6 border-blue-900/30 text-white hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isArchived ||
                isSubmitting ||
                !Object.values(editedFields).some((edited) => edited)
              }
              size="lg"
              className={`px-6 ${
                isArchived
                  ? "bg-gray-600/50 hover:bg-gray-700/50 cursor-not-allowed"
                  : Object.values(editedFields).some((edited) => edited)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600/50 hover:bg-blue-700/50 cursor-not-allowed"
              }`}
            >
              <Save className="mr-2 h-5 w-5" />
              {isArchived ? "Document Archived" : isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentEditForm;
