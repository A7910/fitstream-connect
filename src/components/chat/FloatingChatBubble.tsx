import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MessageList, { Message } from "./MessageList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const FloatingChatBubble = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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
          profiles:sender_id (
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${session?.user?.id},sender_id.in.(select user_id from admin_users)`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
  });

  const unreadCount = messages.filter(
    (msg) => !msg.is_read && msg.sender_id !== session?.user?.id
  ).length;

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

  const markMessagesAsRead = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .neq("sender_id", session.user.id)
        .eq("is_read", false);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open) markMessagesAsRead();
      }}>
        <SheetTrigger asChild>
          <Button size="icon" className="h-12 w-12 rounded-full relative">
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Chat with Admin</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <MessageList messages={messages} currentUserId={session.user.id} />
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FloatingChatBubble;