import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, 
  Download, 
  Globe, 
  MapPin, 
  Monitor, 
  Tablet, 
  Trash2, 
  Clock, 
  LogOut,
  Settings,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

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
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!session) return null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { icon: <Heart className="w-5 h-5" />, label: "Favourites" },
    { icon: <Download className="w-5 h-5" />, label: "Downloads" },
    { icon: <Globe className="w-5 h-5" />, label: "Language" },
    { icon: <MapPin className="w-5 h-5" />, label: "Location" },
    { icon: <Monitor className="w-5 h-5" />, label: "Display" },
    { icon: <Tablet className="w-5 h-5" />, label: "Feed preference" },
    { icon: <Monitor className="w-5 h-5" />, label: "Subscription" },
    { icon: <Trash2 className="w-5 h-5" />, label: "Clear Cache" },
    { icon: <Clock className="w-5 h-5" />, label: "Clear history" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold">My Profile</h1>
          <Settings className="w-6 h-6 text-gray-600" />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-xl font-semibold mb-1">{profile?.full_name || "User"}</h2>
          <p className="text-gray-600 mb-4">{session.user.email}</p>
          <Button 
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-red-500">Log Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* App Version */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          App version 003
        </div>
      </div>
    </div>
  );
};

export default Profile;