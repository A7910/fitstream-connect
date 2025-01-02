import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={cn("flex gap-2", isCurrentUser && "flex-row-reverse")}
          >
            <Avatar>
              <AvatarImage src={message.profiles.avatar_url} />
              <AvatarFallback>
                {message.profiles.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex flex-col gap-1 max-w-[70%]",
                isCurrentUser && "items-end"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {message.profiles.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), "p")}
                </span>
              </div>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;