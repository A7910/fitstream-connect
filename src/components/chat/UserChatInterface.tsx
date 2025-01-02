import { useChatMessages } from "@/hooks/use-chat-messages";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const UserChatInterface = () => {
  const { messages, adminId } = useChatMessages();

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            message={msg}
            type={msg.type}
          />
        ))}
      </div>
      <ChatInput adminId={adminId} />
    </div>
  );
};

export default UserChatInterface;