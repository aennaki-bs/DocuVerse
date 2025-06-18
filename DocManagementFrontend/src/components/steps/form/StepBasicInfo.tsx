import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStepForm } from "./StepFormProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  descriptif: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const StepBasicInfo = () => {
  const { formData, setFormData, registerStepForm } = useStepForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formData.title || "",
      descriptif: formData.descriptif || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(1, {
      validate: async () => {
        const result = await form.trigger();
        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form]);

  // Update the parent form data when form values change
  const handleChange = (field: keyof FormValues, value: string) => {
    form.setValue(field, value);
    setFormData({ [field]: value });
  };

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md rounded-lg">
      <CardContent className="p-3">
        <Form {...form}>
          <form className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-300 text-xs font-medium">
                    Step Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter step title"
                      {...field}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md h-8 text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptif"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-300 text-xs font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter step description"
                      {...field}
                      rows={3}
                      onChange={(e) =>
                        handleChange("descriptif", e.target.value)
                      }
                      className="bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md resize-none text-xs min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
