import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
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
import { Check } from "lucide-react";

interface UserSelectorProps {
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
}

const UserSelector = ({ selectedUser, onUserSelect }: UserSelectorProps) => {
  const [open, setOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      console.log("Fetching active users...");
      const { data: memberships, error } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      if (!memberships) {
        console.log("No memberships found");
        return [];
      }
      
      // Filter out duplicates and null profiles
      const uniqueUsers = memberships
        .filter(m => m.profiles) // Filter out null profiles
        .filter((m, index, self) => 
          index === self.findIndex(t => t.user_id === m.user_id)
        );

      console.log("Filtered users:", uniqueUsers);
      return uniqueUsers;
    },
  });

  const selectedUserName = users.find(u => u.user_id === selectedUser)?.profiles?.full_name;

  return (
    <div className="space-y-2">
      <Label>Select User</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {selectedUser ? (
              <span>{selectedUserName || "Unnamed User"}</span>
            ) : (
              <span>Select a user</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {users.map((membership) => (
                <CommandItem
                  key={membership.user_id}
                  value={membership.profiles?.full_name || ""}
                  onSelect={() => {
                    onUserSelect(membership.user_id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={membership.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{membership.profiles?.full_name || "Unnamed User"}</span>
                  {selectedUser === membership.user_id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UserSelector;