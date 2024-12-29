import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if user is authenticated
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log("Checking session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        throw error;
      }
      console.log("Session status:", session ? "Found" : "Not found");
      return session;
    },
  });

  // Check if user is admin
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log("Checking admin status for user:", session?.user?.id);
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session?.user?.id)
        .maybeSingle();
      
      if (error) {
        console.error("Admin check error:", error);
        throw error;
      }
      
      const isAdminUser = !!data;
      console.log("Is admin user:", isAdminUser);
      return isAdminUser;
    },
    retry: false, // Don't retry if the query fails
    staleTime: 1000 * 60 * 5, // Cache the result for 5 minutes
  });

  useEffect(() => {
    const setupAuthListener = () => {
      console.log("Setting up auth listener");
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (!session) {
          console.log("No session found in auth change");
          return;
        }

        try {
          // Check if the user is an admin
          const { data, error } = await supabase
            .from("admin_users")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error checking admin status:", error);
            setAuthError("Error verifying admin status");
            return;
          }

          if (data) {
            console.log("Admin verified, redirecting to dashboard");
            toast({
              title: "Login successful",
              description: "Welcome back, admin!",
            });
            navigate("/admin");
          } else {
            console.log("Non-admin user detected");
            toast({
              title: "Access denied",
              description: "This account does not have admin privileges",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          setAuthError("An error occurred during authentication");
        }
      });

      return () => {
        console.log("Cleaning up auth listener");
        subscription.unsubscribe();
      };
    };

    const cleanup = setupAuthListener();
    return () => {
      if (cleanup) cleanup();
    };
  }, [navigate, toast]);

  // Redirect if already authenticated and is admin
  useEffect(() => {
    if (!sessionLoading && !adminLoading && session && isAdmin) {
      console.log("User is authenticated and is admin, redirecting to dashboard");
      navigate("/admin");
    }
  }, [session, isAdmin, sessionLoading, adminLoading, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <Alert className="mb-6">
            <AlertDescription>
              This page is for admin users only. If you're a regular user, please use the regular login page.
            </AlertDescription>
          </Alert>
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8B5CF6',
                    brandAccent: '#7C3AED',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;