import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UserChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [adminId, setAdminId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch admin ID
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("user_id")
        .single();

      if (adminData) {
        setAdminId(adminData.user_id);

        // Fetch messages between user and admin
        const { data: messagesData, error } = await supabase
          .from("chat_messages")
          .select(`
            *,
            sender:profiles!sender_id(*)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${adminData.user_id}),and(sender_id.eq.${adminData.user_id},recipient_id.eq.${user.id})`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          return;
        }

        setMessages(messagesData || []);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("chat_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("New message received:", payload);
            setMessages((prevMessages) => [...prevMessages, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !adminId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("chat_messages").insert({
        content: message.trim(),
        sender_id: user.id,
        recipient_id: adminId,
      });

      if (error) throw error;
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender_id === adminId ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
              {msg.sender?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_id === adminId
                  ? "bg-muted"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message admin..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserChatInterface;