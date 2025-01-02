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

      // Fetch first available admin ID
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .limit(1);

      if (adminError) {
        console.error("Error fetching admin:", adminError);
        return;
      }

      if (adminData && adminData.length > 0) {
        const firstAdminId = adminData[0].user_id;
        setAdminId(firstAdminId);

        // Fetch both admin messages and user messages
        const [adminMessagesResponse, userMessagesResponse] = await Promise.all([
          supabase
            .from("admin_messages")
            .select("*, sender:profiles!admin_id(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("user_messages")
            .select("*, sender:profiles!user_id(*)")
            .eq("user_id", user.id)
            .eq("admin_id", firstAdminId)
            .order("created_at", { ascending: true })
        ]);

        if (adminMessagesResponse.error) {
          console.error("Error fetching admin messages:", adminMessagesResponse.error);
        }
        if (userMessagesResponse.error) {
          console.error("Error fetching user messages:", userMessagesResponse.error);
        }

        // Combine and sort messages
        const combinedMessages = [
          ...(adminMessagesResponse.data || []).map(msg => ({
            ...msg,
            type: 'admin'
          })),
          ...(userMessagesResponse.data || []).map(msg => ({
            ...msg,
            type: 'user'
          }))
        ].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        setMessages(combinedMessages);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to admin messages
      const adminChannel = supabase
        .channel("admin_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "admin_messages",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("New admin message received:", payload);
            setMessages((prevMessages) => [...prevMessages, { ...payload.new, type: 'admin' }]);
          }
        )
        .subscribe();

      // Subscribe to user messages
      const userChannel = supabase
        .channel("user_messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_messages",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("New user message received:", payload);
            setMessages((prevMessages) => [...prevMessages, { ...payload.new, type: 'user' }]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(adminChannel);
        supabase.removeChannel(userChannel);
      };
    };

    setupSubscription();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !adminId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("user_messages").insert({
        content: message.trim(),
        user_id: user.id,
        admin_id: adminId,
      });

      if (error) throw error;

      // Optimistically add message to state
      const newMessage = {
        content: message.trim(),
        user_id: user.id,
        admin_id: adminId,
        created_at: new Date().toISOString(),
        type: 'user'
      };
      setMessages((prev) => [...prev, newMessage]);
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
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex items-start gap-2 ${
              msg.type === 'admin' ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
              {msg.sender?.full_name?.[0]?.toUpperCase() || (msg.type === 'admin' ? 'A' : 'U')}
            </div>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.type === 'admin'
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