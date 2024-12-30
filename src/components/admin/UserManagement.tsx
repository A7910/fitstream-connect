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

        const { error } = await supabase
          .from("user_memberships")
          .insert({
            user_id: userId,
            plan_id: planId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            status: "active"
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (error) throw error;
      }

      toast({
        title: `Membership ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
        description: `The user's membership has been ${action === 'activate' ? 'activated' : 'deactivated'}.`,
      });

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["all-memberships"] });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay to ensure DB update is complete
      await queryClient.invalidateQueries({ queryKey: ["all-users"] });
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

  const usersWithMembership = allUsers?.map(user => ({
    ...user,
    membership: memberships?.find(m => m.user_id === user.id)
  })) || [];

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