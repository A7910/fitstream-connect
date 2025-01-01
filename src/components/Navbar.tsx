import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import LoggedInNav from "./nav/LoggedInNav";
import LoggedOutNav from "./nav/LoggedOutNav";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session, isError, refetch } = useQuery({
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            await refetch();
          } else if (event === 'SIGNED_IN') {
            console.log("User signed in");
            await refetch();
          } else if (event === 'TOKEN_REFRESHED') {
            console.log("Token refreshed");
            await refetch();
          }
        });

        return session;
      } catch (error) {
        console.error("Error fetching session:", error);
        await supabase.auth.signOut();
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

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

  if (isError || !session) {
    return <LoggedOutNav />;
  }

  return <LoggedInNav isAdmin={!!isAdmin} onLogout={handleLogout} />;
};

export default Navbar;