import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface MembershipStatsProps {
  users: any[];
  memberships: any[];
}

export const MembershipStats = ({ users, memberships }: MembershipStatsProps) => {
  // Calculate membership statistics
  const usersWithMembership = users.map(user => {
    const userMemberships = memberships?.filter(m => m.user_id === user.id) || [];
    // Sort memberships by created_at in descending order and get the latest one
    const latestMembership = userMemberships.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    // Check if the membership is active and not expired
    const isActive = latestMembership?.status === "active" && 
      new Date(latestMembership.end_date) >= new Date();
    
    return {
      ...user,
      membership: latestMembership ? {
        ...latestMembership,
        status: isActive ? "active" : "inactive"
      } : null
    };
  });

  // Count active and inactive members
  const activeMembers = usersWithMembership.filter(user => 
    user.membership?.status === "active"
  ).length;

  const inactiveMembers = usersWithMembership.filter(user => 
    !user.membership || user.membership.status === "inactive"
  ).length;

  // Calculate expiring soon members (within next 3 days)
  const expiringMembers = usersWithMembership.filter(user => {
    if (!user.membership || user.membership.status !== "active") return false;
    const endDate = new Date(user.membership.end_date);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    return endDate >= today && endDate <= threeDaysFromNow;
  }).length;

  console.log("Membership statistics:", {
    total: usersWithMembership.length,
    active: activeMembers,
    inactive: inactiveMembers,
    expiring: expiringMembers,
    rawUsers: users.length,
    rawMemberships: memberships.length,
    usersWithMembership: usersWithMembership.map(u => ({
      id: u.id,
      name: u.full_name,
      membershipStatus: u.membership?.status,
      endDate: u.membership?.end_date
    }))
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active:</span>
            <span className="text-sm font-medium text-green-600">{activeMembers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Inactive:</span>
            <span className="text-sm font-medium text-red-600">{inactiveMembers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Expiring Soon:</span>
            <span className="text-sm font-medium text-yellow-600">{expiringMembers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};