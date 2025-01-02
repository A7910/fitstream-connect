import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./navbar/NavLinks";
import { MobileMenu } from "./navbar/MobileMenu";
import { DesktopMenu } from "./navbar/DesktopMenu";

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

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Obees Fitness</span>
            </Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <DesktopMenu 
            session={session}
            isAdmin={isAdmin}
            handleLogout={handleLogout}
          />
        </div>

        <MobileMenu 
          isMenuOpen={isMenuOpen}
          session={session}
          isAdmin={isAdmin}
          handleLogout={handleLogout}
        />
      </div>
    </nav>
  );
};

export default Navbar;
