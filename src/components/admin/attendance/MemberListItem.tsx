import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface MemberListItemProps {
  userId: string;
  fullName: string | null;
  phoneNumber: string | null;
  startDate: string;
  endDate: string;
  isSelected: boolean;
  isCheckedIn: boolean;
  onSelect: (userId: string) => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export const MemberListItem = ({
  userId,
  fullName,
  phoneNumber,
  startDate,
  endDate,
  isSelected,
  isCheckedIn,
  onSelect,
  onCheckIn,
  onCheckOut,
}: MemberListItemProps) => {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 transform ${
        isCheckedIn
          ? "translate-x-full opacity-0"
          : isSelected
          ? "border-primary bg-primary/5"
          : "hover:bg-accent"
      }`}
      onClick={() => !isCheckedIn && onSelect(userId)}
    >
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="font-medium">{fullName || "N/A"}</p>
          <p className="text-sm text-muted-foreground">
            {phoneNumber || "No phone number"}
          </p>
          <p className="text-sm text-muted-foreground">
            Membership: {format(new Date(startDate), 'PP')} - {format(new Date(endDate), 'PP')}
          </p>
        </div>
        {isSelected && !isCheckedIn && (
          <div className="flex gap-2">
            <Button size="sm" onClick={onCheckIn}>
              Check In
            </Button>
            <Button size="sm" variant="outline" onClick={onCheckOut}>
              Check Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};