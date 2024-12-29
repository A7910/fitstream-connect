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

  // Check if user is admin with better error handling
  const { data: isAdmin, isError } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      try {
        console.log("Checking if user is admin...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found");
          return false;
        }

        console.log("Session found, checking admin status for user:", session.user.id);
        const { data, error } = await supabase
          .from("admin_users")
          .select()
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking admin status:", error);
          throw error;
        }

        console.log("Admin check result:", !!data);
        return !!data;
      } catch (error) {
        console.error("Error in admin check:", error);
        setAuthError("Error checking admin status. Please try again.");
        return false;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    let isSubscribed = true;

    const setupAuthListener = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);
          
          if (!session || !isSubscribed) return;

          try {
            // Check if the user is an admin
            const { data, error } = await supabase
              .from("admin_users")
              .select()
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (error) {
              console.error("Error checking admin status:", error);
              setAuthError("Error verifying admin status. Please try again.");
              return;
            }

            if (data) {
              console.log("Admin user confirmed, redirecting to dashboard");
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
              // Sign out the non-admin user
              await supabase.auth.signOut();
              navigate("/");
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setAuthError("An error occurred during authentication. Please try again.");
          }
        });

        return () => {
          isSubscribed = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setAuthError("Error setting up authentication. Please refresh the page.");
      }
    };

    setupAuthListener();
  }, [navigate, toast]);

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