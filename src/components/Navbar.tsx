import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./nav/NavLinks";
import { MobileMenu } from "./nav/MobileMenu";

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
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        if (session) {
          const fetchAdminStatus = async () => {
            const { data, error: adminError } = await supabase
              .from("admin_users")
              .select()
              .eq("user_id", session.user.id)
              .maybeSingle();
  
            if (adminError) {
              console.error("Error fetching admin status:", adminError);
            }
            setIsAdmin(!!data);
          };
          fetchAdminStatus();
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
      }
    });
  
    return () => subscription?.unsubscribe();
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

  return (
    <nav className="absolute w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/0f504862-ae25-4b37-b398-ca1574510015.png" 
                alt="Logo" 
                className="h-12 w-12 rounded-full"
              />
              <span className="text-xl font-bold text-white ml-2">Obees Fitness</span>
            </Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLinks 
              isAdmin={isAdmin} 
              handleLogout={handleLogout} 
              session={session} 
            />
            {!session && (
              <Link to="/login">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  Login
                </Button>
              </Link>
            )}
          </div>
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