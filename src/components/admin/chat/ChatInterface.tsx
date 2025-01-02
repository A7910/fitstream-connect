import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import UserList from "./UserList";

const ChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch both admin messages and user messages
      const [adminMessagesResponse, userMessagesResponse] = await Promise.all([
        supabase
          .from("admin_messages")
          .select("*, sender:profiles!admin_id(*)")
          .or(`admin_id.eq.${user.id},user_id.eq.${selectedUser.id}`)
          .order("created_at", { ascending: true }),
        supabase
          .from("user_messages")
          .select("*, sender:profiles!user_id(*)")
          .or(`user_id.eq.${selectedUser.id},admin_id.eq.${user.id}`)
          .order("created_at", { ascending: true })
      ]);

      if (adminMessagesResponse.error || userMessagesResponse.error) {
        toast({
          title: "Error fetching messages",
          description: adminMessagesResponse.error?.message || userMessagesResponse.error?.message,
          variant: "destructive",
        });
        return [];
      }

      // Combine and format messages
      const combinedMessages = [
        ...(adminMessagesResponse.data || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.admin_id,
          recipient_id: msg.user_id,
          created_at: msg.created_at,
          sender: {
            full_name: msg.sender?.full_name,
            avatar_url: msg.sender?.avatar_url
          }
        })),
        ...(userMessagesResponse.data || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.user_id,
          recipient_id: msg.admin_id,
          created_at: msg.created_at,
          sender: {
            full_name: msg.sender?.full_name,
            avatar_url: msg.sender?.avatar_url
          }
        }))
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return combinedMessages;
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!selectedUser) return;

    const { data: { user } } = await supabase.auth.getUser();

    // Subscribe to admin messages
    const adminChannel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_messages",
          filter: `user_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          console.log("New admin message received:", payload);
          queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedUser.id] });
        }
      )
      .subscribe();

    // Subscribe to user messages
    const userChannel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_messages",
          filter: `admin_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New user message received:", payload);
          queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedUser.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adminChannel);
      supabase.removeChannel(userChannel);
    };
  }, [selectedUser, queryClient]);

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