import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { ClipboardList } from "lucide-react";

const formSchema = z.object({
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export const SubTypeDetails = () => {
  const { formData, setFormData, errors } = useSubTypeForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: formData.description || "",
      startDate: formData.startDate || new Date().toISOString().split("T")[0],
      endDate:
        formData.endDate ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
      isActive: formData.isActive ?? true,
    },
  });

  const handleChange = (field: keyof FormValues, value: any) => {
    form.setValue(field, value);
    setFormData({ [field]: value });
  };

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-blue-900/20 p-3 border-b border-blue-900/30">
        <CardTitle className="text-sm text-blue-300 flex items-center">
          <ClipboardList className="h-4 w-4 mr-2" />
          Additional Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <form className="space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-blue-300 text-xs font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter subtype description"
                      {...field}
                      rows={3}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className="bg-[#0a1033] border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md resize-none text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-blue-300 text-xs font-medium">
                      Start Date *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) =>
                            handleChange("startDate", e.target.value)
                          }
                          className="h-9 pl-9 bg-[#0a1033] border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md text-sm"
                        />
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
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400/70"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                      </div>
                    </FormControl>
                    {errors.startDate && (
                      <p className="text-red-500 text-xs">{errors.startDate}</p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-blue-300 text-xs font-medium">
                      End Date *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) =>
                            handleChange("endDate", e.target.value)
                          }
                          className="h-9 pl-9 bg-[#0a1033] border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md text-sm"
                        />
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
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400/70"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                      </div>
                    </FormControl>
                    {errors.endDate && (
                      <p className="text-red-500 text-xs">{errors.endDate}</p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between py-1">
                  <FormLabel className="text-blue-300 text-xs font-medium">
                    Status
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          handleChange("isActive", checked)
                        }
                        className="data-[state=checked]:bg-blue-500 h-5 w-9"
                      />
                      <span className="text-xs text-blue-300/90">
                        {field.value ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
