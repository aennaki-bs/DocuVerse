import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  FileEdit,
  Power,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

export const SubTypeReview = () => {
  const { formData, prevStep, handleSubmit } = useSubTypeForm();

  // Apply default dates if they're not set
  useEffect(() => {
    if (!formData.startDate || !formData.endDate) {
      // This will trigger a re-render with the default dates
      prevStep();
      setTimeout(() => {
        prevStep(); // Go back to review step after defaults are applied
      }, 100);
    }
  }, []);

  const formatSimpleDate = (dateStr?: string | Date) => {
    if (!dateStr) return "Not set";
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return String(dateStr);
    }
  };

  // Calculate duration between dates
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    // Check if dates are valid
    if (end < start) return null;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate months and years
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    // Handle edge case where day of month affects month calculation
    if (end.getDate() < start.getDate()) {
      months--;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let durationText = "";
    if (years > 0) {
      durationText += `${years} year${years > 1 ? "s" : ""}`;
      if (remainingMonths > 0)
        durationText += ` ${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        }`;
    } else if (months > 0) {
      durationText += `${months} month${months > 1 ? "s" : ""}`;
    } else {
      durationText += `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }

    return { days: diffDays, text: durationText };
  };

  const duration = calculateDuration();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  // Go to specific step (replacement for previous goToStep function)
  const goToStep = (step: number) => {
    if (step === 1) {
      prevStep();
      prevStep();
    } else if (step === 2) {
      prevStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
        <CardHeader className="bg-blue-900/20 p-3 border-b border-blue-900/30 flex-shrink-0">
          <CardTitle className="text-sm text-blue-300 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-400" />
            Review Information
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-grow overflow-auto max-h-[calc(100vh-250px)]">
          <CardContent className="p-4">
            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                    Dates & Status
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToStep(1)}
                    className="h-7 px-2 py-0 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 border-blue-900/40"
                  >
                    <FileEdit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="bg-blue-900/20 rounded-md p-3 space-y-3 border border-blue-900/40">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-blue-300/70 font-medium mr-1">
                          Start Date
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 font-normal text-blue-300/70 border-blue-900/50"
                        >
                          Required
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-blue-400/70" />
                        {formData.startDate ? (
                          <p className="text-sm text-white">
                            {formatSimpleDate(formData.startDate)}
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-400 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Using default date
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-blue-300/70 font-medium mr-1">
                          End Date
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 font-normal text-blue-300/70 border-blue-900/50"
                        >
                          Required
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-blue-400/70" />
                        {formData.endDate ? (
                          <p className="text-sm text-white">
                            {formatSimpleDate(formData.endDate)}
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-400 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Using default date
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {duration && (
                    <div className="flex items-center text-xs bg-blue-900/30 p-2 rounded-md border border-blue-900/40">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-400/80" />
                      <span className="text-blue-300/80">
                        Duration:{" "}
                        <span className="text-blue-300">{duration.text}</span>
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-xs text-blue-300/70 font-medium">
                        Status
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full mr-1.5 ${
                          formData.isActive === false ? "bg-red-500" : "bg-green-500"
                        }`}
                      ></div>
                      <div className="flex items-center">
                        <Power className="h-3.5 w-3.5 mr-1.5 text-blue-400/80" />
                        <p className="text-sm text-white font-medium">
                          {formData.isActive === false ? "Inactive" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-300 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                    Prefix
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToStep(2)}
                    className="h-7 px-2 py-0 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 border-blue-900/40"
                  >
                    <FileEdit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="bg-blue-900/20 rounded-md p-3 space-y-3 border border-blue-900/40">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-xs text-blue-300/70 font-medium mr-1">
                        Prefix
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-4 font-normal text-blue-300/70 border-blue-900/50"
                      >
                        Optional
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      {formData.name ? (
                        <p className="text-sm text-white font-medium">
                          {formData.name}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 font-medium italic">
                          No prefix provided
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </ScrollArea>

        {/* <div className="p-4 border-t border-blue-900/30 bg-blue-500/10 mt-auto flex-shrink-0">
          <motion.div
            variants={item}
            className="rounded-md p-3 border border-blue-500/20 space-y-2"
          >
            <div className="flex items-center text-blue-400 text-sm mb-1">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Ready to create?
            </div>
            <p className="text-xs text-blue-300/80">
              Please review all information above before submitting. You can go
              back to edit any section using the Edit buttons.
            </p>
            <div className="pt-1 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => goToStep(1)}
                className="text-xs h-8 border-blue-900/40 text-blue-300"
              >
                Start Over
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={submitForm}
                className="text-xs h-8 bg-blue-600 hover:bg-blue-500 text-white"
              >
                Create Subtype
              </Button>
            </div>
          </motion.div>
        </div> */}
      </Card>
    </motion.div>
  );
};
