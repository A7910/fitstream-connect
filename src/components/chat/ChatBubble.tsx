import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import UserChatInterface from "./UserChatInterface";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch unread messages from both tables
      const [adminMessages, userMessages] = await Promise.all([
        supabase
          .from("admin_messages")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_read", false),
        supabase
          .from("user_messages")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_read", false)
      ]);

      if (adminMessages.error || userMessages.error) {
        console.error("Error fetching unread messages:", adminMessages.error || userMessages.error);
        return;
      }

      setUnreadCount((adminMessages.data?.length || 0) + (userMessages.data?.length || 0));
    };

    fetchUnreadMessages();

    // Subscribe to new messages
    const { data: { user } } = await supabase.auth.getUser();
    
    const adminChannel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New admin message received in bubble:", payload);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    const userChannel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New user message received in bubble:", payload);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adminChannel);
      supabase.removeChannel(userChannel);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 w-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Chat with Admin</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <UserChatInterface />
        </div>
      ) : (
        <Button
          size="icon"
          className="rounded-full h-12 w-12 relative"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default ChatBubble;