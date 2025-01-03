import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ClubSection = () => {
  const [openPlan, setOpenPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price");
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubscribe = (planId: string) => {
    navigate("/login");
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-PK')}`;
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h3 className="font-bebas text-4xl mb-12 text-[#020817] tracking-wider">THE CLUB</h3>
        <div className="space-y-6 w-full md:w-[80%] mx-auto">
          {plans?.map((plan) => (
            <Collapsible
              key={plan.id}
              open={openPlan === plan.id}
              onOpenChange={() => setOpenPlan(openPlan === plan.id ? null : plan.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between p-6 bg-[#9b87f5]/10 backdrop-blur-sm rounded-lg w-full hover:bg-[#9b87f5]/20 transition-all border border-[#9b87f5]/20">
                <h4 className="font-bebas text-2xl text-[#020817]">{plan.name}</h4>
                <span className="text-2xl text-[#9b87f5] transition-transform duration-300">
                  {openPlan === plan.id ? "-" : "+"}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-content-slide-down data-[state=closed]:animate-content-slide-up">
                <div className="p-6 bg-[#020817] backdrop-blur-sm border border-[#9b87f5]/20 rounded-b-lg mt-1">
                  <p className="font-poppins text-white mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-white mb-4 font-poppins">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="space-y-2 mb-6">
                    {parseFeatures(plan.features as string).map((feature, index) => (
                      <div key={index} className="flex items-center text-white font-poppins">
                        <span className="mr-2 text-[#9b87f5]">•</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white transition-colors font-poppins"
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    Subscribe Now
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};