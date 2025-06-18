import { useState, useEffect } from "react";
import {
  Check,
  Search,
  Users,
  X,
  UserRound,
  UserPlus,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ListOrdered,
  GripVertical,
  MoveVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApproverInfo } from "@/models/approval";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SelectUsersStepProps {
  availableUsers: ApproverInfo[];
  selectedUsers: ApproverInfo[];
  isLoading: boolean;
  isSequential?: boolean;
  onSelectedUsersChange: (users: ApproverInfo[]) => void;
}

export function SelectUsersStep({
  availableUsers,
  selectedUsers,
  isLoading,
  isSequential = false,
  onSelectedUsersChange,
}: SelectUsersStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ApproverInfo[]>([]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(availableUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, availableUsers]);

  const handleToggleUser = (user: ApproverInfo) => {
    const isSelected = selectedUsers.some((u) => u.userId === user.userId);

    if (isSelected) {
      // Remove user
      onSelectedUsersChange(
        selectedUsers.filter((u) => u.userId !== user.userId)
      );
    } else {
      // Add user
      onSelectedUsersChange([...selectedUsers, user]);
    }
  };

  const isUserSelected = (userId: number) => {
    return selectedUsers.some((user) => user.userId === userId);
  };

  const handleRemoveSelectedUser = (userId: number) => {
    onSelectedUsersChange(
      selectedUsers.filter((user) => user.userId !== userId)
    );
  };

  const moveUser = (userId: number, direction: "up" | "down") => {
    const index = selectedUsers.findIndex((u) => u.userId === userId);
    if (index === -1) return;

    const newUsers = [...selectedUsers];
    if (direction === "up" && index > 0) {
      // Swap with the user above
      [newUsers[index], newUsers[index - 1]] = [
        newUsers[index - 1],
        newUsers[index],
      ];
      onSelectedUsersChange(newUsers);
    } else if (direction === "down" && index < selectedUsers.length - 1) {
      // Swap with the user below
      [newUsers[index], newUsers[index + 1]] = [
        newUsers[index + 1],
        newUsers[index],
      ];
      onSelectedUsersChange(newUsers);
    }
  };

  // Move user to a specific position
  const moveUserToPosition = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= selectedUsers.length ||
      toIndex < 0 ||
      toIndex >= selectedUsers.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const newUsers = [...selectedUsers];
    const [movedUser] = newUsers.splice(fromIndex, 1);
    newUsers.splice(toIndex, 0, movedUser);
    onSelectedUsersChange(newUsers);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Select Users</h3>
        <p className="text-xs text-muted-foreground">
          Choose users who will be part of this approval group
        </p>
      </div>

      {isSequential && (
        <Alert
          variant="warning"
          className="bg-purple-500/10 border-purple-500/30 py-1.5 px-3 text-xs"
        >
          <MoveVertical className="h-3 w-3 text-purple-600" />
          <AlertDescription className="text-purple-900 dark:text-purple-300 text-xs">
            <span className="font-semibold">
              Sequential approval order is important.
            </span>{" "}
            Use arrows to change the order.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Users */}
      <div className="space-y-1">
        <Label className="text-xs font-medium flex items-center gap-1">
          {isSequential ? (
            <ListOrdered className="h-3 w-3 text-purple-500" />
          ) : (
            <UserRound className="h-3 w-3 text-blue-500" />
          )}
          {isSequential ? "Users in Approval Sequence" : "Selected Users"} (
          {selectedUsers.length})
        </Label>
        <div
          className={`border rounded-md p-1.5 min-h-[40px] ${
            isSequential
              ? "bg-purple-500/5 border-purple-500/20"
              : "bg-muted/30"
          }`}
        >
          {selectedUsers.length === 0 ? (
            <div className="flex items-center justify-center h-[30px] text-xs text-muted-foreground">
              No users selected yet
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {selectedUsers.map((user, index) => (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between py-1 px-2 rounded-md ${
                    isSequential
                      ? "bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isSequential && (
                      <span className="inline-flex justify-center items-center w-5 h-5 rounded-full bg-purple-600/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                        {index + 1}
                      </span>
                    )}
                    {isSequential && (
                      <GripVertical className="h-3 w-3 text-purple-500/70" />
                    )}
                    <span className="text-xs">{user.username}</span>
                    {user.role && (
                      <span className="text-[10px] text-muted-foreground">
                        ({user.role})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isSequential && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                          onClick={() => moveUser(user.userId, "up")}
                          disabled={index === 0}
                          title="Move up in sequence"
                        >
                          <ArrowUp className="h-3 w-3" />
                          <span className="sr-only">Move up</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full p-0 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                          onClick={() => moveUser(user.userId, "down")}
                          disabled={index === selectedUsers.length - 1}
                          title="Move down in sequence"
                        >
                          <ArrowDown className="h-3 w-3" />
                          <span className="sr-only">Move down</span>
                        </Button>
                        {selectedUsers.length > 2 && (
                          <select
                            className="h-5 w-auto text-[10px] bg-transparent border border-purple-500/30 rounded px-1 text-purple-700 dark:text-purple-300"
                            value={index}
                            onChange={(e) =>
                              moveUserToPosition(
                                index,
                                parseInt(e.target.value)
                              )
                            }
                            title="Move to position"
                          >
                            {selectedUsers.map((_, i) => (
                              <option key={i} value={i}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        )}
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 hover:bg-muted text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveSelectedUser(user.userId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Users className="h-3 w-3 text-blue-500" />
            Available Users
          </Label>
          <div className="relative w-[180px]">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-6 text-xs"
            />
          </div>
        </div>

        <div className="border rounded-md">
          <ScrollArea className="h-[170px] rounded-md">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-3 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-2 w-[70px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
                {searchQuery.trim() !== "" ? (
                  <>
                    <Search className="h-5 w-5 mb-1 opacity-50" />
                    <p className="text-xs">No results for "{searchQuery}"</p>
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-1 h-6 text-xs p-0"
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mb-1 opacity-50" />
                    <p className="text-xs">No users available</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-1.5">
                {filteredUsers.map((user) => {
                  const isSelected = isUserSelected(user.userId);
                  return (
                    <div
                      key={user.userId}
                      className={`flex items-center space-x-1.5 py-1 px-1.5 hover:bg-muted/50 rounded-md cursor-pointer transition-colors ${
                        isSelected ? "bg-muted" : ""
                      }`}
                      onClick={() => handleToggleUser(user)}
                    >
                      <Checkbox
                        checked={isSelected}
                        id={`user-${user.userId}`}
                        onCheckedChange={() => handleToggleUser(user)}
                        className="h-3.5 w-3.5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <div className="grid gap-0">
                        <label
                          htmlFor={`user-${user.userId}`}
                          className="text-xs font-medium cursor-pointer"
                        >
                          {user.username}
                        </label>
                        {user.role && (
                          <span className="text-[10px] text-muted-foreground">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
