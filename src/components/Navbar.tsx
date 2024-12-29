import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, isError, refetch } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        // First try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found");
          return null;
        }

        return session;
      } catch (error) {
        console.error("Error fetching session:", error);
        // Clear any invalid session data
        await supabase.auth.signOut();
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider session data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep session data in cache for 30 minutes (renamed from cacheTime)
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await refetch();
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

  // If there's a session error or no session, show the logged-out state
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
            {session ? (
              <>
                <Link to="/workout-plan">
                  <Button variant="ghost">Workout Plan</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;