import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { NavLinks } from "./navbar/NavLinks";
import { MobileMenu } from "./navbar/MobileMenu";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      setSession(session);
  
      if (session) {
        // Fetch the admin status
        const { data, error: adminError } = await supabase
          .from("admin_users")
          .select()
          .eq("user_id", session.user.id)
          .maybeSingle();
  
        if (adminError) {
          console.error("Error fetching admin status:", adminError);
        }
  
        setIsAdmin(!!data); // If there's data, the user is an admin
      }
    };
  
    // Get session on mount
    getSession();
  
    // Listen for auth state changes (sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        if (session) {
          // Fetch admin status after sign-in
          const fetchAdminStatus = async () => {
            const { data, error: adminError } = await supabase
              .from("admin_users")
              .select()
              .eq("user_id", session.user.id)
              .maybeSingle();
  
            if (adminError) {
              console.error("Error fetching admin status:", adminError);
            }
  
            setIsAdmin(!!data); // If data exists, user is admin
          };
  
          fetchAdminStatus();
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
      }
    });
  
    return () => {
      // Cleanup subscription on component unmount
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setIsAdmin(false);
      navigate("/");
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!session) {
    return (
      <nav className="bg-background border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-foreground">FitStream Connect</span>
              </Link>
            </div>
            
            <div className="flex items-center md:hidden">
              <MobileMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <NavLinks session={session} isAdmin={isAdmin} handleLogout={handleLogout} />
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>

          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLinks session={session} isAdmin={isAdmin} handleLogout={handleLogout} />
              <Link to="/login" className="block">
                <Button className="w-full">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-foreground">FitStream Connect</span>
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <MobileMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLinks session={session} isAdmin={isAdmin} handleLogout={handleLogout} />
          </div>
        </div>

        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLinks session={session} isAdmin={isAdmin} handleLogout={handleLogout} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
