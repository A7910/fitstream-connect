import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MessageList, { Message } from "../chat/MessageList";

const MessagesManagement = () => {
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages"],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id) return;

    try {
      const { error } = await supabase.from("chat_messages").insert({
        content: newMessage,
        sender_id: session.user.id,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="col-span-3 h-[calc(100vh-13rem)]">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-5rem)]">
        <ScrollArea className="flex-1">
          <MessageList messages={messages} currentUserId={session?.user?.id} />
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="pt-4 border-t mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessagesManagement;