import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { MembershipCard } from "@/components/profile/MembershipCard";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { BackButton } from "@/components/ui/back-button";

const Profile = () => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return null;
      }
      return session;
    },
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (!session) return null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-primary font-bebas text-xl">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-4xl font-bebas text-primary mb-8">Your Profile</h1>
        <div className="grid gap-6">
          <MembershipCard userId={session.user.id} />
          <ProfileForm 
            profile={profile} 
            email={session.user.email} 
            userId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;