import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface WorkoutUserListProps {
  users: any[];
  selectedUser: string | null;
  searchQuery: string;
  onUserSelect: (userId: string) => void;
  onSearchChange: (query: string) => void;
}

export const WorkoutUserList = ({
  users,
  selectedUser,
  searchQuery,
  onUserSelect,
  onSearchChange,
}: WorkoutUserListProps) => {
  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedUser === user.id ? "bg-muted" : ""
              }`}
              onClick={() => onUserSelect(user.id)}
            >
              <Avatar>
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {user.full_name || "Unnamed User"}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              {searchQuery
                ? "No users found matching your search"
                : "No users with assigned workouts"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};