import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useSession = () => {
  const navigate = useNavigate();
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

  return { session, isError };
};