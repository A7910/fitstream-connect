import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MembershipStatusProps {
  membership: any;
}

export const getMembershipStatus = (membership: any) => {
  if (!membership) return "inactive";
  
  const today = new Date();
  const endDate = new Date(membership.end_date);
  
  if (membership.status === "active" && endDate < today) {
    return "expired";
  }
  
  return membership.status;
};

export const getMembershipStatusColor = (membership: any) => {
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

export const MembershipStatus = ({ membership }: MembershipStatusProps) => {
  const status = getMembershipStatus(membership);
  const statusColor = getMembershipStatusColor(membership);

  return (
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
      {membership && (
        <p className="text-sm text-muted-foreground">
          Expires: {format(new Date(membership.end_date), "MMM dd, yyyy")}
        </p>
      )}
    </div>
  );
};