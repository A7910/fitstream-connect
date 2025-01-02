import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./navigation/NavLinks";
import { MobileMenu } from "./navigation/MobileMenu";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error);
          return;
        }
        
        if (session) {
          setSession(session);
          const { data: adminData, error: adminError } = await supabase
            .from("admin_users")
            .select()
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error("Error fetching admin status:", adminError);
          }
          setIsAdmin(!!adminData);
        } else {
          setSession(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Session fetch error:", error);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        if (session) {
          const { data: adminData, error: adminError } = await supabase
            .from("admin_users")
            .select()
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error("Error fetching admin status:", adminError);
          }
          setIsAdmin(!!adminData);
        }
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        setIsAdmin(false);
        // Clear any stored session data
        await supabase.auth.signOut();
        localStorage.removeItem('supabase.auth.token');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      // First clear local storage
      localStorage.removeItem('supabase.auth.token');
      
      // Then sign out from Supabase
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
              <span className="text-xl font-bold">FitStream Connect</span>
            </Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLinks session={session} isAdmin={isAdmin} onLogout={handleLogout} />
            {!session && (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>

        <MobileMenu 
          isOpen={isMenuOpen}
          session={session}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      </div>
    </nav>
  );
};

export default Navbar;