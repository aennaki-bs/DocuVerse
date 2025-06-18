import { DocumentCircuitHistory } from "@/models/documentCircuit";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface WorkflowHistorySectionProps {
  history: DocumentCircuitHistory[];
  isLoading?: boolean;
  isEmbedded?: boolean;
}

export function WorkflowHistorySection({
  history = [],
  isLoading = false,
  isEmbedded = true,
}: WorkflowHistorySectionProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No history available for this document
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[600px] pr-4">
      <div className="space-y-3 relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-blue-900/20"></div>

        {history.map((historyItem, index) => (
          <motion.div
            key={historyItem.id}
            className="relative pl-12"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center",
                historyItem.isApproved
                  ? "bg-gradient-to-br from-green-500/30 to-blue-500/20 border border-green-500/30"
                  : "bg-gradient-to-br from-amber-500/30 to-blue-500/20 border border-amber-500/30"
              )}
            >
              {historyItem.isApproved ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>

            {/* Content card */}
            <Card
              className={cn(
                "overflow-hidden border transition-all duration-200",
                historyItem.isApproved
                  ? "border-green-500/20 bg-gradient-to-r from-green-900/10 to-blue-900/5"
                  : "border-amber-500/20 bg-gradient-to-r from-amber-900/10 to-blue-900/5"
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">
                      {historyItem.statusTitle}
                    </span>
                    {historyItem.actionTitle &&
                      historyItem.actionTitle !== "N/A" && (
                        <Badge className="bg-blue-900/50 text-blue-200 text-xs">
                          {historyItem.actionTitle}
                        </Badge>
                      )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      historyItem.isApproved
                        ? "border-green-500/30 text-green-400 bg-green-900/20"
                        : "border-amber-500/30 text-amber-400 bg-amber-900/20"
                    )}
                  >
                    {historyItem.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs mb-2 flex-wrap">
                  <div className="flex items-center text-gray-400">
                    <User className="h-3 w-3 mr-1 text-blue-400" />
                    <span>{historyItem.processedBy || "System"}</span>
                  </div>

                  <div className="flex items-center text-gray-400">
                    <Clock className="h-3 w-3 mr-1 text-blue-400" />
                    <span>
                      {format(
                        new Date(historyItem.processedAt),
                        "MMM d, HH:mm"
                      )}
                    </span>
                  </div>
                </div>

                {historyItem.comments && (
                  <div className="mt-1 p-2 bg-blue-900/20 rounded-md border border-blue-900/30">
                    <div className="flex items-center text-blue-300 text-xs mb-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Comments:
                    </div>
                    <div className="text-xs text-gray-300">
                      {historyItem.comments}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
