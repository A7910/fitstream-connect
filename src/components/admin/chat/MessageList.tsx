import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollRef} className="h-[400px] pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender_id === currentUserId ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.profiles?.avatar_url || ""} />
              <AvatarFallback>
                {message.profiles?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex flex-col ${
                message.sender_id === currentUserId ? "items-end" : ""
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(message.created_at), "p")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};