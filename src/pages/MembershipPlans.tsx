import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const MembershipPlans = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price");
      
      if (error) {
        console.error("Error fetching plans:", error);
        throw error;
      }
      return data;
    }
  });

  const handleSubscribe = async (planId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plans?.find(p => p.id === planId)?.duration_months || 0));

    const { error } = await supabase
      .from("user_memberships")
      .insert({
        user_id: user.id,
        plan_id: planId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active"
      });

    if (error) {
      console.error("Error subscribing to plan:", error);
      toast({
        title: "Subscription failed",
        description: "There was an error processing your subscription",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Subscription successful",
      description: "You have successfully subscribed to the plan"
    });
    navigate("/profile");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Membership Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-4">${plan.price}</div>
              <div className="space-y-2">
                {plan.features && Array.isArray(JSON.parse(plan.features as string)) && 
                  JSON.parse(plan.features as string).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {feature}
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.id)}
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MembershipPlans;