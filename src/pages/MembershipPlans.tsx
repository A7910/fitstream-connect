
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

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
      
      // Filter out "No Plan" and remove duplicates by name
      const filteredPlans = data?.filter(plan => plan.name !== "No Plan") || [];
      const uniquePlans = filteredPlans.reduce((acc: any[], current) => {
        const existingPlan = acc.find(plan => plan.name === current.name);
        if (!existingPlan) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      return uniquePlans;
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

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-PK')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const parseFeatures = (featuresStr: string | null): string[] => {
    if (!featuresStr) return [];
    try {
      const parsed = JSON.parse(featuresStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing features:", e);
      return [];
    }
  };

  return (
    <div className="container mx-auto py-8">
      <BackButton />
      <h1 className="text-2xl md:text-3xl font-bebas text-primary text-center mb-8">Membership Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="flex flex-col bg-white shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bebas text-primary">{plan.name}</CardTitle>
              <CardDescription className="font-poppins text-sm md:text-base text-gray-600">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-2xl md:text-3xl font-bold font-bebas text-primary mb-4">{formatPrice(plan.price)}</div>
              <div className="space-y-2">
                {parseFeatures(plan.features as string).map((feature, index) => (
                  <div key={index} className="flex items-center font-poppins text-sm md:text-base text-gray-600">
                    <span className="mr-2 text-primary">•</span>
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-poppins" 
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
