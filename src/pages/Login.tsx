import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
          
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Password requirements:
              <ul className="list-disc ml-4 mt-2 text-sm">
                <li>Minimum 6 characters</li>
                <li>At least 1 number</li>
                <li>At least 1 special character</li>
              </ul>
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
            localization={{
              variables: {
                sign_up: {
                  password_placeholder: "Minimum 6 characters, 1 number, 1 symbol",
                  confirmation_text: "Check your email for the confirmation link",
                },
              },
            }}
            showLinks={true}
            view="sign_up"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;