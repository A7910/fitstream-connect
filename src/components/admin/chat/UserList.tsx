import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface UserListProps {
  onSelectUser: (user: any) => void;
  selectedUser: any;
}

const UserList = ({ onSelectUser, selectedUser }: UserListProps) => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Users</h3>
      </div>
      <div className="divide-y">
        {users?.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={cn(
              "w-full p-4 text-left hover:bg-muted transition-colors",
              selectedUser?.id === user.id && "bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium">{user.full_name || "Unnamed User"}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserList;