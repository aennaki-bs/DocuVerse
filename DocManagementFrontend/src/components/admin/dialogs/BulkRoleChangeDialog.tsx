import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkRoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedCount: number;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

function getRoleIcon(role: string) {
  switch (role) {
    case "Admin":
      return <ShieldAlert className="h-4 w-4 text-red-400 mr-2" />;
    case "FullUser":
      return <ShieldCheck className="h-4 w-4 text-emerald-400 mr-2" />;
    case "SimpleUser":
      return <Shield className="h-4 w-4 text-blue-400 mr-2" />;
    default:
      return <ShieldQuestion className="h-4 w-4 text-gray-400 mr-2" />;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "Admin":
      return "text-red-300 bg-red-900/20 border-red-500/30";
    case "FullUser":
      return "text-emerald-300 bg-emerald-900/20 border-emerald-500/30";
    case "SimpleUser":
      return "text-blue-300 bg-blue-900/20 border-blue-500/30";
    default:
      return "text-gray-300 bg-gray-900/20 border-gray-500/30";
  }
}

export function BulkRoleChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
  selectedRole,
  onRoleChange,
}: BulkRoleChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-md w-full"
        aria-describedby="role-change-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              Change Role for Selected Users
            </DialogTitle>
          </div>
          <DialogDescription
            id="role-change-description"
            className="text-blue-300"
          >
            Select the role to assign to {selectedCount} user
            {selectedCount !== 1 ? "s" : ""}:
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
          <Select value={selectedRole} onValueChange={onRoleChange}>
            <SelectTrigger className="w-full bg-[#111633]/80 border-blue-900/50 text-white relative focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-blue-500">
              <SelectValue placeholder="Select a role">
                {selectedRole && (
                  <div className="flex items-center">
                    {getRoleIcon(selectedRole)}
                    <span>{selectedRole}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-blue-100 rounded-lg shadow-lg z-[200]"
              sideOffset={5}
            >
              {["Admin", "FullUser", "SimpleUser"].map((role) => (
                <SelectItem
                  key={role}
                  value={role}
                  className={`flex items-center ${
                    selectedRole === role
                      ? getRoleColor(role) + " border-l-2 rounded-md"
                      : "text-blue-200 hover:bg-blue-900/30 rounded-md"
                  }`}
                >
                  {getRoleIcon(role)}
                  {role === "Admin"
                    ? "Admin"
                    : role === "FullUser"
                    ? "Full User"
                    : "Simple User"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 p-3 rounded-lg bg-blue-900/30 backdrop-blur-sm border border-blue-900/40">
            <h4 className="text-sm font-medium text-blue-200 mb-2">
              Role permissions:
            </h4>
            {selectedRole === "Admin" && (
              <div className="text-xs text-red-300">
                <p className="flex items-center mb-1">
                  <ShieldAlert className="h-3 w-3 mr-1.5" />
                  Full system access including user management
                </p>
                <p className="text-red-400/80 text-[11px] ml-4.5">
                  Only assign to trusted administrators
                </p>
              </div>
            )}
            {selectedRole === "FullUser" && (
              <div className="text-xs text-emerald-300">
                <p className="flex items-center mb-1">
                  <ShieldCheck className="h-3 w-3 mr-1.5" />
                  Document creation, editing and deletion
                </p>
                <p className="flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-1.5" />
                  Access to all document types
                </p>
              </div>
            )}
            {selectedRole === "SimpleUser" && (
              <div className="text-xs text-blue-300">
                <p className="flex items-center mb-1">
                  <Shield className="h-3 w-3 mr-1.5" />
                  Document viewing and basic operations
                </p>
                <p className="flex items-center">
                  <Shield className="h-3 w-3 mr-1.5" />
                  Limited access to document types
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
            disabled={!selectedRole}
          >
            {getRoleIcon(selectedRole || "SimpleUser")}
            Change Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
