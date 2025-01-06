import { User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

interface UserSelectorProps {
  activeUsers: UserProfile[];
  selectedUsers: string[];
  isLoadingUsers: boolean;
  onUserSelectionChange: (selectedIds: string[]) => void;
}

const UserSelector = ({
  activeUsers,
  selectedUsers,
  isLoadingUsers,
  onUserSelectionChange,
}: UserSelectorProps) => {
  const handleSelectAllUsers = () => {
    if (selectedUsers.length === activeUsers.length) {
      onUserSelectionChange([]);
    } else {
      onUserSelectionChange(activeUsers.map(user => user.id));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center justify-between">
        Recipients
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAllUsers}
          className="ml-2"
        >
          <Users className="h-4 w-4 mr-2" />
          {selectedUsers.length === activeUsers.length ? 'Deselect All' : 'Select All'}
        </Button>
      </label>
      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-4 space-y-2">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : activeUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedUsers.includes(user.id) ? "bg-muted" : ""
              }`}
              onClick={() => {
                onUserSelectionChange(
                  selectedUsers.includes(user.id)
                    ? selectedUsers.filter(id => id !== user.id)
                    : [...selectedUsers, user.id]
                );
              }}
            >
              <Avatar>
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{user.full_name || "Unnamed User"}</div>
                <div className="text-xs text-muted-foreground">{user.phone_number}</div>
              </div>
            </div>
          ))}
          {!isLoadingUsers && activeUsers.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No active users found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserSelector;