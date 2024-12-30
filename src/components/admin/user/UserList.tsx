import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";

interface UserListProps {
  users: any[];
  membershipPlans: any[];
  onMembershipAction: (userId: string, planId: string | null, action: 'activate' | 'deactivate') => void;
}

const UserList = ({ users, membershipPlans, onMembershipAction }: UserListProps) => {
  const getMembershipStatusColor = (status: string, endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (status === "active") {
      if (daysUntilExpiry <= 3) return "yellow";
      return "green";
    }
    return "red";
  };

  const renderMembershipActions = (userId: string, membership: any) => {
    if (!membership || membership.status === "inactive") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Activate Membership <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {membershipPlans?.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onClick={() => onMembershipAction(userId, plan.id, 'activate')}
              >
                {plan.name} - ${plan.price}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onMembershipAction(userId, null, 'deactivate')}
      >
        Deactivate Membership
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const statusColor = user.membership
          ? getMembershipStatusColor(
              user.membership.status,
              user.membership.end_date
            )
          : "red";

        return (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-1">
              <p className="font-medium">{user.full_name}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={statusColor === "red" ? "destructive" : "outline"}
                >
                  {user.membership?.status || "inactive"}
                </Badge>
                {statusColor === "yellow" && (
                  <span className="text-xs text-yellow-600">
                    Expiring soon
                  </span>
                )}
              </div>
              {user.membership && (
                <p className="text-sm text-muted-foreground">
                  Expires:{" "}
                  {format(new Date(user.membership.end_date), "MMM dd, yyyy")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {user.phone_number}
              </div>
              {renderMembershipActions(user.id, user.membership)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;