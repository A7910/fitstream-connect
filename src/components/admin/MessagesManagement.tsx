import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { useToast } from "@/hooks/use-toast";

const MessagesManagement = () => {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      console.log("Fetching messages...");
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          profiles:sender_id (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log("Messages data:", data);
      return data;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    const channel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchMessages]);

  useEffect(() => {
    const count = messages.filter((msg) => !msg.is_read).length;
    setUnreadCount(count);
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        content,
        sender_id: session?.user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All messages marked as read",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Messages</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageList messages={messages} currentUserId={session?.user.id || ""} />
        <MessageInput onSendMessage={handleSendMessage} />
      </CardContent>
    </Card>
  );
};

export default MessagesManagement;