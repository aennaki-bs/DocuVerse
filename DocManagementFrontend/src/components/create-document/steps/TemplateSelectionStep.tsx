import { useState } from "react";
import { Label } from "@/components/ui/label";
import { FileText, Copy, Plus, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock templates - in a real app, these would come from an API
const MOCK_TEMPLATES = [
  {
    id: "template-1",
    name: "Basic Document",
    description: "A simple document with minimal formatting",
    content:
      "# Document Title\n\nEnter your content here.\n\n## Section 1\n\nThis is the first section of your document.",
  },
  {
    id: "template-2",
    name: "Meeting Minutes",
    description: "Template for recording meeting minutes",
    content:
      "# Meeting Minutes\n\n**Date:** [Date]\n**Attendees:** [Names]\n\n## Agenda\n\n1. [Agenda Item 1]\n2. [Agenda Item 2]\n\n## Discussion\n\n### [Agenda Item 1]\n- [Notes]\n\n### [Agenda Item 2]\n- [Notes]\n\n## Action Items\n\n- [ ] [Action Item 1] - Assigned to: [Name], Due: [Date]\n- [ ] [Action Item 2] - Assigned to: [Name], Due: [Date]",
  },
  {
    id: "template-3",
    name: "Project Proposal",
    description: "Template for project proposals",
    content:
      "# Project Proposal: [Project Name]\n\n## Executive Summary\n\n[Brief overview of the project]\n\n## Objectives\n\n- [Objective 1]\n- [Objective 2]\n\n## Scope\n\n[Define what is in and out of scope]\n\n## Timeline\n\n- **Phase 1:** [Description] - [Start Date] to [End Date]\n- **Phase 2:** [Description] - [Start Date] to [End Date]\n\n## Budget\n\n[Budget details]\n\n## Resources Required\n\n- [Resource 1]\n- [Resource 2]\n\n## Expected Outcomes\n\n[Describe the expected outcomes and success criteria]",
  },
];

interface TemplateSelectionStepProps {
  content: string;
  onContentChange: (value: string) => void;
}

export const TemplateSelectionStep = ({
  content,
  onContentChange,
}: TemplateSelectionStepProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = MOCK_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = MOCK_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      // Don't change content immediately, wait for user to click "Use Template"
    }
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      const template = MOCK_TEMPLATES.find((t) => t.id === selectedTemplate);
      if (template) {
        onContentChange(template.content);
      }
    }
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    onContentChange("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          Document Template (Optional)
        </Label>

        <div className="mb-4">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-gray-800 text-white"
          />
        </div>

        <RadioGroup
          value={selectedTemplate || ""}
          onValueChange={handleTemplateSelect}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`bg-gray-900 border-2 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? "border-blue-500"
                    : "border-gray-800 hover:border-gray-700"
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <RadioGroupItem
                    value={template.id}
                    id={template.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={template.id}
                        className="text-white font-medium cursor-pointer"
                      >
                        {template.name}
                      </Label>
                      {selectedTemplate === template.id && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Start from scratch option */}
            <Card
              className={`bg-gray-900 border-2 border-dashed cursor-pointer transition-all ${
                selectedTemplate === null && content === ""
                  ? "border-blue-500"
                  : "border-gray-800 hover:border-gray-700"
              }`}
              onClick={handleStartFromScratch}
            >
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                    <Plus className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-white font-medium">Start from Scratch</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Create a document without using a template
                  </p>
                </div>
              </CardContent>
            </Card>

            {filteredTemplates.length === 0 && searchQuery !== "" && (
              <div className="col-span-2 py-8 text-center text-gray-400">
                <p>No templates match your search</p>
              </div>
            )}
          </div>
        </RadioGroup>
      </div>

      {selectedTemplate && (
        <div className="flex justify-end">
          <Button
            onClick={handleUseTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Copy className="mr-2 h-4 w-4" />
            Use Template
          </Button>
        </div>
      )}

      <div className="text-sm text-gray-400">
        <p>
          Templates provide a starting point for your document content. You can
          edit the content after selecting a template.
        </p>
      </div>
    </div>
  );
};
