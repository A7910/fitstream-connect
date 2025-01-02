import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: any;
  type: 'admin' | 'user';
}

const ChatMessage = ({ message, type }: ChatMessageProps) => {
  return (
    <div
      className={`flex items-start gap-2 ${
        type === 'admin' ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
        {message.sender?.full_name?.[0]?.toUpperCase() || (type === 'admin' ? 'A' : 'U')}
      </div>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          type === 'admin'
            ? "bg-muted"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;