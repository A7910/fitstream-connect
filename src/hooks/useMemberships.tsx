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

      // Get the user's current membership if it exists
      const { data: existingMembership, error: fetchError } = await supabase
        .from("user_memberships")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (fetchError) throw fetchError;

      if (action === 'activate') {
        if (!planId) {
          throw new Error("No plan selected");
        }

        let membershipStartDate = startDate;
        let membershipEndDate = endDate;

        // If dates aren't provided, calculate them based on the last membership
        if (!startDate || !endDate) {
          if (existingMembership) {
            // If there's an existing membership, start from its end date
            membershipStartDate = new Date(existingMembership.end_date);
            membershipEndDate = new Date(existingMembership.end_date);
            membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
          } else {
            // If no existing membership, start from today
            membershipStartDate = new Date();
            membershipEndDate = new Date();
            membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
          }
        }

        console.log("Calculated membership dates:", { 
          membershipStartDate, 
          membershipEndDate,
          existingMembership 
        });

        if (existingMembership) {
          // Update existing membership
          const { error: updateError } = await supabase
            .from("user_memberships")
            .update({
              plan_id: planId,
              start_date: membershipStartDate.toISOString().split('T')[0],
              end_date: membershipEndDate.toISOString().split('T')[0],
              status: "active"
            })
            .eq("user_id", userId);

          if (updateError) throw updateError;
        } else {
          // Create new membership if none exists
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
        }
      } else {
        // Deactivate membership if it exists
        if (existingMembership) {
          const { error: deactivateError } = await supabase
            .from("user_memberships")
            .update({ status: "inactive" })
            .eq("user_id", userId);

          if (deactivateError) throw deactivateError;
        }
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