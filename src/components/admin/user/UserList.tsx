import { useState } from "react";
import { MembershipStatus } from "./MembershipStatus";
import { MembershipActions } from "./MembershipActions";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserListProps {
  users: any[];
  membershipPlans: any[];
  onMembershipAction: (
    userId: string,
    planId: string | null,
    action: 'activate' | 'deactivate',
    startDate?: Date,
    endDate?: Date
  ) => void;
}

const UserList = ({ users, membershipPlans, onMembershipAction }: UserListProps) => {
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: { start: Date | undefined; end: Date | undefined } }>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <p className="font-medium">{user.full_name}</p>
            <MembershipStatus membership={user.membership} />
            <div className="text-sm text-muted-foreground">
              {user.phone_number}
            </div>
          </div>
          <MembershipActions
            userId={user.id}
            membership={user.membership}
            membershipPlans={membershipPlans}
            selectedDates={selectedDates[user.id] || { start: undefined, end: undefined }}
            onDateChange={(start, end) =>
              setSelectedDates(prev => ({
                ...prev,
                [user.id]: { start, end }
              }))
            }
            onMembershipAction={onMembershipAction}
          />
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No users found
        </p>
      )}
    </div>
  );
};

export default UserList;