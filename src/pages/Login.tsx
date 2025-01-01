import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

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
      console.log("Auth state changed:", event);
      if (session) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      toast({
        title: "Success",
        description: "Confirmation email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend confirmation email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const authOverrides = {
    onSubmit: async (formData: any) => {
      console.log("Form submitted:", formData);
      setEmail(formData.email);
      
      // Password requirements
      const password = formData.password;
      const confirmPassword = formData.password_confirm || formData.confirmPassword;
      
      const minLength = password?.length >= 6;
      const hasNumber = /\d/.test(password || '');
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password || '');
      const passwordsMatch = password === confirmPassword;

      const errors: string[] = [];

      if (!minLength) errors.push("Password must be at least 6 characters long");
      if (!hasNumber) errors.push("Password must contain at least one number");
      if (!hasSpecialChar) errors.push("Password must contain at least one special character");
      if (!passwordsMatch) errors.push("Passwords do not match");

      if (errors.length > 0) {
        console.log("Validation failed:", errors);
        return {
          error: {
            message: errors.join(", "),
          }
        };
      }

      console.log("Validation passed, proceeding with signup");
      return true;
    },
    localization: {
      variables: {
        sign_up: {
          password_label: "Password (min 6 chars, 1 number, 1 special char)",
          confirmation_text: (
            <div className="space-y-2">
              <p>Check your email for the confirmation link</p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  handleResendConfirmation();
                }}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend confirmation email"}
              </Button>
            </div>
          ),
        },
      },
    },
    elements: {
      confirmPassword: {
        label: "Confirm Password",
        placeholder: "Confirm your password",
      },
    },
  };

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
                <li>Passwords must match</li>
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
                  password_input_placeholder: "Minimum 6 characters, 1 number, 1 symbol",
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