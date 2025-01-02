import { Button } from "@/components/ui/button";
import { Activity, Award, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [session, setSession] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    // Check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchAnnouncement();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchAnnouncement();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("message, message_type")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching announcement:", error);
        return;
      }

      if (data) {
        setAnnouncement(data.message);
        setMessageType(data.message_type || "info");
        setDisplayText(""); // Reset display text for new announcement
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Typing animation effect
  useEffect(() => {
    if (announcement && displayText.length < announcement.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText(announcement.slice(0, displayText.length + 1));
      }, 50); // Adjust speed as needed
      return () => clearTimeout(timeoutId);
    }
  }, [announcement, displayText]);

  const getAnnouncementStyles = () => {
    const baseStyles = "rounded-lg p-4 mb-4 text-center animate-fade-in";
    switch (messageType) {
      case "success":
        return cn(baseStyles, "bg-green-100 text-green-800 border border-green-200");
      case "warning":
        return cn(baseStyles, "bg-yellow-100 text-yellow-800 border border-yellow-200");
      case "alert":
        return cn(baseStyles, "bg-red-100 text-red-800 border border-red-200");
      default:
        return cn(baseStyles, "bg-blue-100 text-blue-800 border border-blue-200");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Announcement Bar */}
      <div className="container mx-auto px-4 relative z-10">
        {session && announcement && (
          <div className={getAnnouncementStyles()}>
            <p className="font-medium">{displayText}</p>
          </div>
        )}
      </div>

      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/lovable-uploads/fba9eb4e-9f88-49cc-ac0d-91a795c7fa73.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/50" /> {/* Dark overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6">
              Transform Your Fitness Journey with{" "}
              <span className="text-primary">Obees Fitness</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Your all-in-one platform for gym management, fitness tracking, and
              achieving your wellness goals.
            </p>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-lg px-8 py-6 rounded-full">
              Start Your Journey
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Activity,
    title: "Track Your Progress",
    description:
      "Monitor your fitness journey with detailed insights and analytics.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Join a community of fitness enthusiasts and share your achievements.",
  },
  {
    icon: Award,
    title: "Achieve Goals",
    description:
      "Set personalized fitness goals and celebrate your milestones.",
  },
];

export default Hero;