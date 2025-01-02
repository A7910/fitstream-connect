import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { MembershipCard } from "@/components/profile/MembershipCard";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  if (!session) return null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-md p-6">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-md">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)} 
                className="text-gray-600 hover:text-gray-800"
              >
                ←
              </button>
              <h1 className="text-xl font-semibold">My Profile</h1>
              <Settings className="w-6 h-6 text-gray-600" />
            </div>

            {/* Profile Info */}
            <ProfileForm 
              profile={profile} 
              email={session.user.email} 
              userId={session.user.id}
            />

            {/* Membership Status */}
            <MembershipCard userId={session.user.id} />

            {/* Logout Button */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>

            {/* App Version */}
            <p className="text-center text-sm text-gray-400">
              App version: 0.0.3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;