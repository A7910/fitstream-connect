import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MembershipStatusProps {
  membership: any;
}

export const getMembershipStatus = (membership: any) => {
  if (!membership) return "inactive";
  if (membership.status !== "active") return "inactive";
  
  const today = new Date();
  const endDate = new Date(membership.end_date);
  endDate.setHours(23, 59, 59, 999); // Set to end of day
  
  if (endDate < today) {
    return "expired";
  }
  
  return "active";
};

export const getMembershipStatusColor = (membership: any) => {
  if (!membership || membership.status !== "active") return "red";
  
  const today = new Date();
  const endDate = new Date(membership.end_date);
  endDate.setHours(23, 59, 59, 999); // Set to end of day
  
  if (endDate < today) return "red";
  
  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) return "yellow";
  return "green";
};

export const MembershipStatus = ({ membership }: MembershipStatusProps) => {
  const status = getMembershipStatus(membership);
  const statusColor = getMembershipStatusColor(membership);

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={statusColor === "red" ? "destructive" : "outline"}
        className={
          statusColor === "yellow" ? "border-yellow-500 text-yellow-500" :
          statusColor === "green" ? "border-green-500 text-green-500" : ""
        }
      >
        {status}
      </Badge>
      {statusColor === "yellow" && (
        <span className="text-xs text-yellow-600">
          Expiring soon
        </span>
      )}
      {membership && membership.status === "active" && (
        <p className="text-sm text-muted-foreground">
          Expires: {format(new Date(membership.end_date), "MMM dd, yyyy")}
        </p>
      )}
    </div>
  );
};