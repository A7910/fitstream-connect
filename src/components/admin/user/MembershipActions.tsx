import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DateSelector } from "./DateSelector";
import { getMembershipStatus } from "./MembershipStatus";

interface MembershipActionsProps {
  userId: string;
  membership: any;
  membershipPlans: any[];
  selectedDates: { start?: Date; end?: Date };
  onDateChange: (start?: Date, end?: Date) => void;
  onMembershipAction: (
    userId: string,
    planId: string | null,
    action: 'activate' | 'deactivate',
    startDate?: Date,
    endDate?: Date
  ) => void;
}

export const MembershipActions = ({
  userId,
  membership,
  membershipPlans,
  selectedDates,
  onDateChange,
  onMembershipAction,
}: MembershipActionsProps) => {
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
                  onMembershipAction(
                    userId,
                    plan.id,
                    'activate',
                    selectedDates.start,
                    selectedDates.end
                  );
                }}
              >
                {plan.name} - ${plan.price}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DateSelector
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          onDateChange={onDateChange}
        />
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