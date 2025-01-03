import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ClubSection } from "./sections/ClubSection";
import { TrainingSection } from "./sections/TrainingSection";

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
        setDisplayText("");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (announcement && displayText.length < announcement.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText(announcement.slice(0, displayText.length + 1));
      }, 50);
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
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="container mx-auto px-4 relative z-10">
        {session && announcement && (
          <div className={getAnnouncementStyles()}>
            <p className="font-medium">{displayText}</p>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-bebas text-[100px] font-bold leading-[0.85] mb-0">
            FIND YOUR<br />STRENGTH
          </h1>
          <h2 className="font-bebas text-[80px] font-bold leading-none mt-4 mb-8">
            INSIDE AND OUT.
          </h2>
          <div className="relative rounded-2xl overflow-hidden my-12">
            <img 
              src="/lovable-uploads/7e30cabe-eb07-40cd-b33c-8f543e1bc0f1.png" 
              alt="Fitness Training"
              className="w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Accessibility Section */}
      <div className="text-center py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="font-bebas text-3xl mb-4">FITNESS SHOULD BE ACCESSIBLE TO EVERYONE.</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Whether you're a seasoned athlete or just starting out, our expert trainers are here to guide you through your fitness journey. We believe in creating an inclusive environment where everyone can thrive.
          </p>
          <Button variant="outline" className="rounded-full">
            JOIN TODAY
          </Button>
        </div>
      </div>

      {/* Training Options */}
      <TrainingSection />

      {/* Membership Plans */}
      <ClubSection />

      {/* Final CTA */}
      <div className="bg-black text-white py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-bebas text-[80px] mb-6">YOUR BODY IS YOUR TEMPLE</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Take the first step towards a stronger, healthier you. Join our community and transform your life through fitness.
          </p>
          <Button className="bg-white text-black hover:bg-gray-100">
            GET STARTED
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;