import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminLogin = () => {
  const navigate = useNavigate();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data } = await supabase
        .from("admin_users")
        .select()
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Check if the user is an admin
        const { data } = await supabase
          .from("admin_users")
          .select()
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (data) {
          // If admin, redirect to admin dashboard
          navigate("/admin");
        } else {
          // If not admin, show error and redirect to home
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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