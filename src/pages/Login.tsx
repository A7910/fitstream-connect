import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing session on component mount
    const clearSession = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error clearing session:", error);
      }
    };
    clearSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully, redirecting...");
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      } else if (event === 'USER_UPDATED') {
        console.log("User data updated");
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const authOverrides = {
    onSubmit: async (formData: any) => {
      console.log("Form submitted, validating...");
      
      if (formData.view === "sign-up") {
        const password = formData.password;
        
        if (!password) {
          console.log("Missing password");
          return {
            error: {
              message: "Password is required",
            }
          };
        }

        const minLength = password.length >= 6;
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors: string[] = [];

        if (!minLength) errors.push("Password must be at least 6 characters long");
        if (!hasNumber) errors.push("Password must contain at least one number");
        if (!hasSpecialChar) errors.push("Password must contain at least one special character");

        if (errors.length > 0) {
          console.log("Validation failed:", errors);
          return {
            error: {
              message: errors.join(", "),
            }
          };
        }
      }

      console.log("Validation passed, proceeding with auth");
      return true;
    },
    localization: {
      variables: {
        sign_up: {
          password_label: "Password (min 6 chars, 1 number, 1 special char)",
          password_input_label: "Password",
          password_input_placeholder: "Your password",
          confirmation_text: "Check your email for the confirmation link",
        },
      },
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container max-w-md mx-auto px-4">
        <BackButton />
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
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_up: {
                  password_input_placeholder: "Minimum 6 characters, 1 number, 1 symbol",
                  email_input_placeholder: "Your email address",
                  confirmation_text: "Check your email for the confirmation link",
                },
              },
            }}
            showLinks={true}
            view="sign_in"
            {...authOverrides}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;