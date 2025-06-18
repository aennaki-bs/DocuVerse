import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import adminService from "@/services/adminService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, FileText, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ViewUserLogsDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserLogsDialog({
  userId,
  open,
  onOpenChange,
}: ViewUserLogsDialogProps) {
  const {
    data: logs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-logs", userId],
    queryFn: () => adminService.getUserLogs(userId),
    enabled: open,
  });

  const getActionTypeLabel = (actionType: number): string => {
    const actionTypes = {
      0: "Logout",
      1: "Login",
      2: "Profile Create",
      3: "Profile Update",
      4: "Document Create",
      5: "Document Update",
      6: "Document Delete",
      7: "Profile Create",
      8: "Profile Update",
      9: "Profile Delete",
    };

    return (
      actionTypes[actionType as keyof typeof actionTypes] ||
      `Action ${actionType}`
    );
  };

  const getActionColor = (actionType: number): string => {
    switch (actionType) {
      case 0: // Logout
        return "bg-amber-900/20 text-amber-300 border-amber-500/30";
      case 1: // Login
        return "bg-purple-900/20 text-purple-300 border-purple-500/30";
      case 2: // Profile Create
      case 7: // Profile Create (duplicate)
        return "bg-emerald-900/20 text-emerald-300 border-emerald-500/30";
      case 3: // Profile Update
      case 8: // Profile Update (duplicate)
        return "bg-blue-900/20 text-blue-300 border-blue-500/30";
      case 4: // Document Create
        return "bg-emerald-900/20 text-emerald-300 border-emerald-500/30";
      case 5: // Document Update
        return "bg-blue-900/20 text-blue-300 border-blue-500/30";
      case 6: // Document Delete
      case 9: // Profile Delete
        return "bg-red-900/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-900/20 text-gray-300 border-gray-500/30";
    }
  };

  const getActionIcon = (actionType: number) => {
    switch (actionType) {
      case 0: // Logout
      case 1: // Login
        return <User className="w-3.5 h-3.5" />;
      case 2: // Profile Create
      case 3: // Profile Update
      case 7: // Profile Create (duplicate)
      case 8: // Profile Update (duplicate)
      case 9: // Profile Delete
        return <User className="w-3.5 h-3.5" />;
      case 4: // Document Create
      case 5: // Document Update
      case 6: // Document Delete
        return <FileText className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
        <DialogHeader className="p-6 border-b border-blue-900/30">
          <DialogTitle className="text-xl text-blue-100">
            User Activity Logs
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Comprehensive history of user interactions and system events
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-10 text-blue-300">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span className="animate-pulse">Loading activity logs...</span>
            </div>
          ) : isError ? (
            <div className="text-red-400 py-10 flex items-center justify-center bg-red-900/10 rounded-lg border border-red-900/30">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error loading activity logs. Please try again.
            </div>
          ) : logs && logs.length > 0 ? (
            <ScrollArea className="h-[50vh] pr-4">
              <div className="rounded-lg border border-blue-900/30 overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-900/30 sticky top-0">
                    <TableRow className="border-blue-900/30 hover:bg-transparent">
                      <TableHead className="text-blue-200 font-medium">
                        Action
                      </TableHead>
                      <TableHead className="text-blue-200 font-medium">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-blue-200 font-medium">
                        Description
                      </TableHead>
                      <TableHead className="text-blue-200 font-medium">
                        User
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-blue-900/30 hover:bg-blue-900/20 transition-colors duration-150"
                      >
                        <TableCell>
                          <Badge
                            className={`${getActionColor(
                              log.actionType
                            )} px-2 py-1 flex items-center gap-1 border`}
                          >
                            {getActionIcon(log.actionType)}
                            {getActionTypeLabel(log.actionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{format(new Date(log.timestamp), "PPpp")}</span>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {log.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-300 text-xs font-medium">
                              {log.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-blue-100">
                                {log.user.username}
                              </div>
                              {log.user.role && (
                                <div className="text-xs text-blue-400">
                                  {log.user.role}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10 text-blue-400 bg-blue-900/10 rounded-lg border border-blue-900/30">
              No activity logs found for this user
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
