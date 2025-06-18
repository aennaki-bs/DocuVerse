import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface UserOption {
  userId: number;
  username: string;
  email?: string;
  role?: string;
  id: number;
}

interface UserSearchSelectProps {
  options?: UserOption[];
  value?: UserOption | null;
  onChange?: (user: UserOption | null) => void;

  users?: UserOption[];
  selectedUserId?: number;
  onSelect?: (userId: number | undefined) => void;

  isLoading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function UserSearchSelect({
  options,
  value,
  onChange,

  users,
  selectedUserId,
  onSelect,

  isLoading = false,
  placeholder = "Select a user",
  emptyMessage = "No users found",
  className,
}: UserSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const usersList = options || users || [];
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>(usersList);

  const selectedUser =
    value ||
    (selectedUserId
      ? usersList.find((user) => user.userId === selectedUserId)
      : null);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(usersList);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = usersList.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  }, [searchQuery, usersList]);

  const handleSelect = (user: UserOption) => {
    if (onChange) {
      onChange(user);
    } else if (onSelect) {
      onSelect(user.userId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white hover:bg-[#182047]/90 transition-colors",
            className
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <Skeleton className="h-5 w-full bg-blue-950/40" />
          ) : selectedUser ? (
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 text-blue-400" />
              <span className="truncate">{selectedUser.username}</span>
              {selectedUser.role && (
                <Badge
                  variant="secondary"
                  className="ml-auto bg-blue-800/40 text-blue-200 text-xs"
                >
                  {selectedUser.role}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-blue-300/70">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-[#0d1541] border-blue-900/50 text-white shadow-lg shadow-blue-900/20">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search users..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9 text-blue-100"
          />
          <CommandEmpty className="py-6 text-blue-300/70">
            {emptyMessage}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <CommandItem
                key={user.userId}
                value={user.userId.toString()}
                onSelect={() => handleSelect(user)}
                className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-blue-800/30 text-blue-100"
              >
                <div className="flex items-center gap-2 flex-1">
                  <User className="h-4 w-4 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.username}</span>
                    {user.email && (
                      <span className="text-xs text-blue-300/70">
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
                {user.role && (
                  <Badge className="ml-auto bg-blue-800/40 text-blue-200 text-xs">
                    {user.role}
                  </Badge>
                )}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4 text-blue-400",
                    selectedUser?.userId === user.userId
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
