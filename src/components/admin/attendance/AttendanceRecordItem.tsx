import { format } from "date-fns";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AttendanceRecordItemProps {
  record: {
    id: string;
    check_in: string;
    check_out: string | null;
    user: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export const AttendanceRecordItem = ({ record }: AttendanceRecordItemProps) => {
  return (
    <div className="p-4 border rounded-lg animate-fade-in">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={record.user?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-medium">{record.user?.full_name || "N/A"}</p>
          <p className="text-sm text-muted-foreground">
            Check-in: {format(new Date(record.check_in), 'PP p')}
          </p>
          {record.check_out && (
            <p className="text-sm text-muted-foreground">
              Check-out: {format(new Date(record.check_out), 'PP p')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};