import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import UserList from "./UserList";

const ChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*, sender:profiles!sender_id(*)")
        .or(`sender_id.eq.${selectedUser.id},sender_id.eq.${(await supabase.auth.getUser()).data.user.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data;
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!selectedUser) return;

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `sender_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          // Invalidate the messages query to refetch
          queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedUser.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4 p-4">
      <div className="w-1/4 bg-white rounded-lg shadow">
        <UserList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      </div>
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow">
        {selectedUser ? (
          <>
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ChatMessageList messages={messages || []} />
            )}
            <ChatInput selectedUser={selectedUser} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;