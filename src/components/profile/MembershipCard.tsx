import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, ChevronRight } from "lucide-react";

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
    <Card 
      className="bg-gray-50 border-none shadow-none hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => navigate("/membership-plans")}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Subscription</h3>
              <p className="text-sm text-gray-500">
                {membership ? (
                  <>
                    {membership.membership_plans.name} · Expires {format(new Date(membership.end_date), 'MMM dd, yyyy')}
                  </>
                ) : (
                  "No active membership"
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};