import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface MemberListItemProps {
  userId: string;
  fullName: string | null;
  phoneNumber: string | null;
  startDate: string;
  endDate: string;
  isSelected: boolean;
  isCheckedIn: boolean;
  avatarUrl?: string | null;
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
  avatarUrl,
  onSelect,
  onCheckIn,
  onCheckOut,
}: MemberListItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'PP') : 'Invalid date';
  };

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{fullName || "N/A"}</p>
            <p className="text-sm text-muted-foreground">
              {phoneNumber || "No phone number"}
            </p>
            <p className="text-sm text-muted-foreground">
              Membership: {formatDate(startDate)} - {formatDate(endDate)}
            </p>
          </div>
        </div>
        {isSelected && !isCheckedIn && (
          <div className="flex gap-2 mt-4 sm:mt-0">
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