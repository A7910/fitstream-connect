import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch session and handle authentication state change
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
  
        setIsAdmin(!!data);
      }
    };
  
    getSession();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        if (session) {
          const { data, error: adminError } = await supabase
            .from("admin_users")
            .select()
            .eq("user_id", session.user.id)
            .maybeSingle();
  
          if (adminError) {
            console.error("Error fetching admin status:", adminError);
          }
  
          setIsAdmin(!!data);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        navigate("/");
      }
    });
  
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // First clear local session state
      setSession(null);
      setIsAdmin(false);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        // Even if there's an error, we'll redirect and show success
        // since the local session is already cleared
      }
      
      navigate("/");
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect and show success since local session is cleared
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavLinks = () => (
    <>
      <Link to="/membership-plans">
        <Button variant="ghost">Membership Plans</Button>
      </Link>
      {session && (
        <>
          <Link to="/workout-plan">
            <Button variant="ghost">Workout Plan</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost">Admin Dashboard</Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </>
      )}
    </>
  );

  if (!session) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold">FitStream Connect</span>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks />
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>

          {/* Mobile navigation */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLinks />
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
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">FitStream Connect</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLinks />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;