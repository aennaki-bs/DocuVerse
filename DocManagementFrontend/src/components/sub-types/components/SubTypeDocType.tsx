import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { Layers } from "lucide-react";

export const SubTypeDocType = () => {
  const { formData, setFormData, documentTypes, errors } = useSubTypeForm();

  const selectedType = documentTypes.find(
    (t) => t.id === formData.documentTypeId
  );

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-blue-900/20 pb-3 border-b border-blue-900/30">
        <CardTitle className="text-sm text-blue-300 flex items-center">
          <Layers className="h-4 w-4 mr-2" />
          Document Type Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="documentType"
              className="text-blue-300 text-xs font-medium"
            >
              Document Type *
            </Label>
            <Select
              value={
                formData.documentTypeId ? String(formData.documentTypeId) : ""
              }
              onValueChange={(value) =>
                setFormData({ documentTypeId: parseInt(value) })
              }
            >
              <SelectTrigger
                id="documentType"
                className="bg-[#0a1033] border-blue-900/50 text-white h-10"
              >
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1033] border-blue-900/50 text-white">
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.documentTypeId && (
              <p className="text-red-500 text-sm">{errors.documentTypeId}</p>
            )}
          </div>

          {selectedType && (
            <div className="mt-2 p-4 bg-blue-900/20 rounded-md border border-blue-900/40">
              <h4 className="text-blue-300 text-xs font-medium mb-2 flex items-center">
                <Layers className="h-3 w-3 mr-1.5 text-blue-400" />
                Selected Document Type
              </h4>
              <p className="text-white text-sm font-medium">
                {selectedType.typeName}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
