import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/hooks/useSession";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { NavLinks } from "./navigation/NavLinks";

const Navbar = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session, isError } = useSession();
  const isAdmin = useAdminStatus(session);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all queries from the cache
      queryClient.clear();
      
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
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">FitStream Connect</span>
            </Link>
          </div>
          <NavLinks 
            session={session} 
            isAdmin={isAdmin} 
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;