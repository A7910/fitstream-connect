import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const [adminId, setAdminId] = useState(null);

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

  return { messages, adminId };
};