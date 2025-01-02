import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [announcement, setAnnouncement] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    fetchAnnouncement();
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
    const baseStyles = "w-full py-2 text-center animate-fade-in";
    switch (messageType) {
      case "success":
        return cn(baseStyles, "bg-green-100 text-green-800");
      case "warning":
        return cn(baseStyles, "bg-yellow-100 text-yellow-800");
      case "alert":
        return cn(baseStyles, "bg-red-100 text-red-800");
      default:
        return cn(baseStyles, "bg-blue-100 text-blue-800");
    }
  };

  return (
    <div className="relative">
      {announcement && (
        <div className={getAnnouncementStyles()}>
          <p className="font-medium">{displayText}</p>
        </div>
      )}
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="/lovable-uploads/0f504862-ae25-4b37-b398-ca1574510015.png"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
            Transform Your Fitness Journey with{" "}
            <span className="text-yellow-400">Obees Fitness</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            Your all-in-one platform for gym management, fitness tracking, and
            achieving your wellness goals.
          </p>
          <Button 
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg px-8 py-6 rounded-full"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;