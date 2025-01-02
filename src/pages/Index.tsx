import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ChatBubble from "@/components/chat/ChatBubble";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      console.log("Starting to fetch membership plans...");
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price");
      
      if (error) {
        console.error("Error fetching plans:", error);
        throw error;
      }
      
      console.log("Raw response from Supabase:", { data, error });
      return data;
    }
  });

  console.log("Current plans state:", plans);

  const handleSubscribe = (planId: string) => {
    navigate("/login");
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString('en-PK')}`;
  };

  const renderFeatures = (features: unknown) => {
    try {
      if (!features) return null;
      
      if (Array.isArray(features)) {
        return features.map((feature: string, index: number) => (
          <div key={index} className="flex items-center">
            <span className="mr-2">•</span>
            {feature}
          </div>
        ));
      }
      
      if (typeof features === 'string') {
        const parsedFeatures = JSON.parse(features);
        if (Array.isArray(parsedFeatures)) {
          return parsedFeatures.map((feature: string, index: number) => (
            <div key={index} className="flex items-center">
              <span className="mr-2">•</span>
              {feature}
            </div>
          ));
        }
      }
      
      return null;
    } catch (err) {
      console.error("Error parsing features:", err);
      return null;
    }
  };

  if (error) {
    console.error("Query error:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Membership Plans</h2>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            Error loading membership plans. Please try again later.
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-3xl font-bold mb-4">{formatPrice(plan.price)}</div>
                  <div className="space-y-2">
                    {renderFeatures(plan.features)}
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
        ) : (
          <div className="text-center text-gray-600">
            No membership plans available at the moment.
          </div>
        )}
      </div>
      {isAuthenticated && <ChatBubble />}
    </div>
  );
};

export default Index;