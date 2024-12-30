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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

  const getMembershipStatusColor = (membership: any) => {
    if (!membership) return "red";
    
    const today = new Date();
    const endDate = new Date(membership.end_date);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (membership.status === "active") {
      if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) return "yellow";
      if (daysUntilExpiry <= 0) return "red";
      return "green";
    }
    return "red";
  };

  const getMembershipStatus = (membership: any) => {
    if (!membership) return "inactive";
    
    const today = new Date();
    const endDate = new Date(membership.end_date);
    
    if (membership.status === "active" && endDate < today) {
      return "expired";
    }
    
    return membership.status;
  };

  const renderDateSelector = (userId: string) => {
    const dates = selectedDates[userId] || { start: undefined, end: undefined };

    return (
      <div className="flex gap-2 items-center mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-[200px]",
                !dates.start && "text-muted-foreground"
              )}
            >
              {dates.start ? format(dates.start, "PPP") : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dates.start}
              onSelect={(date) =>
                setSelectedDates((prev) => ({
                  ...prev,
                  [userId]: { ...prev[userId], start: date || undefined },
                }))
              }
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-[200px]",
                !dates.end && "text-muted-foreground"
              )}
            >
              {dates.end ? format(dates.end, "PPP") : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dates.end}
              onSelect={(date) =>
                setSelectedDates((prev) => ({
                  ...prev,
                  [userId]: { ...prev[userId], end: date || undefined },
                }))
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderMembershipActions = (userId: string, membership: any) => {
    const currentStatus = getMembershipStatus(membership);
    
    if (!membership || currentStatus === "inactive" || currentStatus === "expired") {
      return (
        <div className="space-y-2">
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
                  onClick={() => {
                    const dates = selectedDates[userId];
                    onMembershipAction(
                      userId, 
                      plan.id, 
                      'activate',
                      dates?.start,
                      dates?.end
                    );
                  }}
                >
                  {plan.name} - ${plan.price}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {renderDateSelector(userId)}
        </div>
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
        const status = getMembershipStatus(user.membership);
        const statusColor = getMembershipStatusColor(user.membership);

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
                  {status}
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