import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSelectorProps {
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
}

const UserSelector = ({ selectedUser, onUserSelect }: UserSelectorProps) => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          profiles (
            id,
            full_name
          )
        `)
        .eq("status", "active");

      if (error) throw error;
      return memberships;
    },
  });

  return (
    <div className="space-y-2">
      <Label>Select User</Label>
      <Select
        value={selectedUser || ""}
        onValueChange={onUserSelect}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a user" />
        </SelectTrigger>
        <SelectContent>
          {users?.map((membership) => (
            <SelectItem 
              key={membership.user_id} 
              value={membership.user_id}
            >
              {membership.profiles?.full_name || "Unnamed User"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;