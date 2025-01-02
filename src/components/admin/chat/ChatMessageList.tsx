import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageListProps {
  initialMessages: Array<{
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender: {
      full_name: string;
      avatar_url: string;
    };
  }>;
}

const ChatMessageList = ({ initialMessages }: ChatMessageListProps) => {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState(initialMessages);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch new messages in real-time
  useEffect(() => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex items-start gap-2",
            message.sender_id === currentUser?.id && "flex-row-reverse"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
            {message.sender.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div
            className={cn(
              "max-w-[70%] rounded-lg p-3",
              message.sender_id === currentUser?.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;