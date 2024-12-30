import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import AddUserDialog from "./user/AddUserDialog";
import UserList from "./user/UserList";

interface UserManagementProps {
  memberships: any[];
}

const UserManagement = ({ memberships }: UserManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: membershipPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;
      return profiles;
    },
  });

  const handleMembershipAction = async (
    userId: string, 
    planId: string | null, 
    action: 'activate' | 'deactivate',
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      if (action === 'activate' && !planId) {
        throw new Error("No plan selected");
      }

      if (action === 'activate') {
        if (!startDate || !endDate) {
          toast({
            title: "Date selection required",
            description: "Please select both start and end dates for the membership",
            variant: "destructive",
          });
          return;
        }

        console.log("Activating membership with dates:", { startDate, endDate });

        // First deactivate any existing active memberships for this specific user
        const { error: deactivateError } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (deactivateError) throw deactivateError;

        // Then create the new active membership
        const { error: activateError } = await supabase
          .from("user_memberships")
          .insert({
            user_id: userId,
            plan_id: planId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            status: "active"
          });

        if (activateError) throw activateError;
      } else {
        // Deactivate only the specific user's membership
        const { error } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (error) throw error;
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["all-memberships"] });
      
      // Wait for the database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch only the specific user's memberships
      const { data: updatedMemberships } = await supabase
        .from("user_memberships")
        .select("*")
        .eq("user_id", userId);

      // Force refresh the UI with the updated data
      queryClient.setQueryData(["all-memberships"], (oldData: any[]) => {
        if (!oldData) return updatedMemberships;
        // Update only the memberships for the specific user
        return oldData.filter(m => m.user_id !== userId).concat(updatedMemberships || []);
      });

      toast({
        title: `Membership ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
        description: `The user's membership has been ${action === 'activate' ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing membership:`, error);
      toast({
        title: `Error ${action}ing membership`,
        description: `There was an error ${action}ing the membership. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (isLoadingUsers || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get the latest membership for each user
  const usersWithMembership = allUsers?.map(user => {
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
      membership: {
        ...latestMembership,
        status: isActive ? "active" : "inactive"
      }
    };
  }) || [];

  // Count active and inactive users based on their latest membership status
  const activeUsers = usersWithMembership.filter(user => 
    user.membership?.status === "active"
  ).length;

  const inactiveUsers = usersWithMembership.length - activeUsers;

  console.log("Membership statistics:", {
    total: usersWithMembership.length,
    active: activeUsers,
    inactive: inactiveUsers,
    memberships: usersWithMembership.map(u => ({
      userId: u.id,
      status: u.membership?.status,
      endDate: u.membership?.end_date
    }))
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <div className="mt-2 text-sm text-muted-foreground">
            Active: {activeUsers} | Inactive: {inactiveUsers}
          </div>
        </div>
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