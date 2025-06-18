import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useSubTypeForm } from "./SubTypeFormProvider";

export const SubTypeDatesStatus = () => {
  const { formData, setFormData, errors } = useSubTypeForm();

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-blue-900/20 pb-3 border-b border-blue-900/30">
        <CardTitle className="text-sm text-blue-300 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Dates and Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="startDate"
              className="text-blue-300 text-xs font-medium"
            >
              Start Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className="bg-[#0a1033] border-blue-900/50 text-white justify-start h-10"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.startDate
                    ? format(formData.startDate, "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-[#0a1033] border-blue-900/50 text-white">
                <CalendarComponent
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => setFormData({ startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-red-500 text-sm">{errors.startDate}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="endDate"
              className="text-blue-300 text-xs font-medium"
            >
              End Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className="bg-[#0a1033] border-blue-900/50 text-white justify-start h-10"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.endDate
                    ? format(formData.endDate, "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-[#0a1033] border-blue-900/50 text-white">
                <CalendarComponent
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => setFormData({ endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && (
              <p className="text-red-500 text-sm">{errors.endDate}</p>
            )}
          </div>

          {errors.dateRange && (
            <p className="text-red-500 text-sm">{errors.dateRange}</p>
          )}

          <div className="flex items-center space-x-3 pt-2 mt-2 border-t border-blue-900/30">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ isActive: checked })}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label
              htmlFor="isActive"
              className="text-white text-sm font-medium"
            >
              Active
            </Label>
            <span className="text-xs text-blue-300/70 ml-2">
              (Toggle to set the subtype as active or inactive)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
