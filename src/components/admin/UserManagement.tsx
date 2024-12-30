import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserManagementProps {
  memberships: any[];
}

const UserManagement = ({ memberships }: UserManagementProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {memberships?.map((membership) => {
            const statusColor = getMembershipStatusColor(
              membership.status,
              membership.end_date
            );

            return (
              <div
                key={membership.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{membership.profile?.full_name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor === "red" ? "destructive" : "outline"}>
                      {membership.status}
                    </Badge>
                    {statusColor === "yellow" && (
                      <span className="text-xs text-yellow-600">Expiring soon</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires: {format(new Date(membership.end_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {membership.profile?.phone_number}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;