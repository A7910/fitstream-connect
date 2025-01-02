import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageInput } from "@/components/admin/chat/MessageInput";
import { MessageList } from "@/components/admin/chat/MessageList";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const FloatingChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["user-chat-messages"],
    queryFn: async () => {
      console.log("Fetching user messages...");
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          profiles:sender_id(
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${session?.user.id},sender_id.in.(select user_id from admin_users)`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log("User messages data:", data);
      return data;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (messages && !isOpen) {
      const count = messages.filter(
        (msg) => !msg.is_read && msg.sender_id !== session?.user.id
      ).length;
      setUnreadCount(count);
    }
  }, [messages, isOpen, session?.user.id]);

  const handleSendMessage = async (content: string) => {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        content,
        sender_id: session?.user.id,
      });

      if (error) throw error;
      refetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("sender_id", session?.user.id)
        .eq("is_read", false);

      if (error) throw error;
      refetchMessages();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 h-[500px] flex flex-col p-4">
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
          <div className="flex-grow overflow-hidden">
            <MessageList messages={messages} currentUserId={session.user.id} />
          </div>
          <div className="mt-4">
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        </Card>
      ) : (
        <Button
          size="icon"
          className="rounded-full h-12 w-12 relative"
          onClick={() => {
            setIsOpen(true);
            markMessagesAsRead();
          }}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default FloatingChatBubble;