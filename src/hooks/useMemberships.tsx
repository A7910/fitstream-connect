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

        const { error: updateError } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (updateError) throw updateError;

        const { error: insertError } = await supabase
          .from("user_memberships")
          .insert({
            user_id: userId,
            plan_id: planId,
            start_date: startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            end_date: endDate?.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "active"
          });

        if (insertError) throw insertError;
      } else {
        const { error: deactivateError } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (deactivateError) throw deactivateError;
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["all-memberships"] });
      
      toast({
        title: `Membership ${action}d successfully`,
        description: `The user's membership has been ${action}d.`,
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