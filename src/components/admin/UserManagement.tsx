import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import AddUserDialog from "./user/AddUserDialog";
import UserList from "./user/UserList";
import { useMemberships } from "@/hooks/useMemberships";
import { useUserMembershipData } from "./user/UserMembershipData";

interface UserManagementProps {
  memberships: any[];
}

const UserManagement = ({ memberships }: UserManagementProps) => {
  const { membershipPlans, allUsers, isLoading, handleMembershipAction } = useMemberships();
  
  const usersWithMembership = useUserMembershipData({ 
    allUsers: allUsers || [], 
    memberships 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <AddUserDialog />
      </CardHeader>
      <CardContent>
        <UserList 
          users={usersWithMembership}
          membershipPlans={membershipPlans || []}
          onMembershipAction={handleMembershipAction}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagement;