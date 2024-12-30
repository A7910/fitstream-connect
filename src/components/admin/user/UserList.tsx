import { useState } from "react";
import { MembershipStatus } from "./MembershipStatus";
import { MembershipActions } from "./MembershipActions";

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

  return (
    <div className="space-y-4">
      {users.map((user) => (
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
    </div>
  );
};

export default UserList;