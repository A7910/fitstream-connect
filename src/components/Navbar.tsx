import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        console.log("Fetching session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          await supabase.auth.signOut();
          return null;
        }

        if (!session) {
          console.log("No active session found");
          return null;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session);
          
          // Invalidate and refetch session data
          await queryClient.invalidateQueries({ queryKey: ["session"] });
          
          // Also invalidate admin status when auth state changes
          if (session?.user?.id) {
            await queryClient.invalidateQueries({ queryKey: ["isAdmin", session.user.id] });
          }
          
          if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            navigate("/");
          } else if (event === 'SIGNED_IN') {
            console.log("User signed in");
            navigate("/");
          }
        });

        return session;
      } catch (error) {
        console.error("Error fetching session:", error);
        await supabase.auth.signOut();
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_users")
        .select()
        .eq("user_id", session?.user?.id)
        .maybeSingle();
      return !!data;
    },
  });

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

  if (isError || !session) {
    console.log("No valid session, showing logged-out state");
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold">FitStream Connect</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/membership-plans">
                <Button variant="ghost">Membership Plans</Button>
              </Link>
              <Link to="/login">
                <Button>Login</Button>
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
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">FitStream Connect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;