import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMemberships = () => {
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
      console.log("Handling membership action:", { userId, planId, action, startDate, endDate });

      if (action === 'activate') {
        if (!planId) {
          throw new Error("No plan selected");
        }

        let membershipStartDate = startDate;
        let membershipEndDate = endDate;

        // Get all active memberships for the user
        const { data: existingMemberships, error: fetchError } = await supabase
          .from("user_memberships")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active");

        if (fetchError) throw fetchError;

        console.log("Existing memberships:", existingMemberships);

        // If dates aren't provided, calculate them
        if (!startDate || !endDate) {
          if (existingMemberships && existingMemberships.length > 0) {
            // Get the latest end date from existing memberships
            const latestEndDate = existingMemberships
              .map(m => new Date(m.end_date))
              .reduce((latest, current) => current > latest ? current : latest);
            
            membershipStartDate = latestEndDate;
            membershipEndDate = new Date(latestEndDate);
            membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
          } else {
            membershipStartDate = new Date();
            membershipEndDate = new Date();
            membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
          }
        }

        // Deactivate all existing active memberships
        if (existingMemberships && existingMemberships.length > 0) {
          const { error: deactivateError } = await supabase
            .from("user_memberships")
            .update({ status: "inactive" })
            .eq("user_id", userId)
            .eq("status", "active");

          if (deactivateError) throw deactivateError;
        }

        // Create new membership
        const { error: insertError } = await supabase
          .from("user_memberships")
          .insert({
            user_id: userId,
            plan_id: planId,
            start_date: membershipStartDate.toISOString().split('T')[0],
            end_date: membershipEndDate.toISOString().split('T')[0],
            status: "active"
          });

        if (insertError) throw insertError;

      } else {
        // Deactivate all active memberships for the user
        const { error: deactivateError } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (deactivateError) throw deactivateError;
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["all-memberships"] });
      
      // Wait for the database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch the specific user's memberships
      const { data: updatedMemberships } = await supabase
        .from("user_memberships")
        .select("*")
        .eq("user_id", userId);

      // Force refresh the UI with the updated data
      queryClient.setQueryData(["all-memberships"], (oldData: any[]) => {
        if (!oldData) return updatedMemberships;
        return oldData.filter(m => m.user_id !== userId).concat(updatedMemberships || []);
      });

      toast({
        title: `Membership ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
        description: `The user's membership has been ${action === 'activate' ? 'activated' : 'deactivated'}.`,
      });
    } catch (error: any) {
      console.error(`Error ${action}ing membership:`, error);
      toast({
        title: `Error ${action}ing membership`,
        description: error.message || `There was an error ${action}ing the membership. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return {
    membershipPlans,
    allUsers,
    isLoading: isLoadingPlans || isLoadingUsers,
    handleMembershipAction,
  };
};