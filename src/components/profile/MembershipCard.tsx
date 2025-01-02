import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const MembershipCard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  
  const { data: membership } = useQuery({
    queryKey: ["membership", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select(`
          *,
          membership_plans (
            name,
            description,
            price,
            duration_months
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .order("end_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Status</CardTitle>
      </CardHeader>
      <CardContent>
        {membership ? (
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Current Plan: {membership.membership_plans.name}
            </p>
            <p className="text-sm text-gray-600">
              Expires: {format(new Date(membership.end_date), 'MMMM dd, yyyy')}
            </p>
            <p className="text-sm text-gray-600">
              {membership.membership_plans.description}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">No active membership</p>
            <Button onClick={() => navigate("/membership-plans")}>
              View Membership Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};