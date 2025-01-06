import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  name: string;
  language: string;
  status: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

export const useWhatsAppMessaging = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [languageCode, setLanguageCode] = useState("en_US");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data: memberships, error: membershipError } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          profiles (
            id,
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .eq("status", "active");

      if (membershipError) throw membershipError;

      const uniqueUsers = memberships
        .map(m => m.profiles)
        .filter((profile): profile is UserProfile => !!profile && !!profile.phone_number)
        .filter((profile, index, self) => 
          index === self.findIndex(p => p.id === profile.id)
        );

      setActiveUsers(uniqueUsers);
    } catch (error) {
      console.error('Failed to fetch active users:', error);
      toast({
        title: "Error",
        description: "Failed to load active users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { action: 'getTemplates' }
      });

      if (error) throw error;

      if (data.data) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({
        title: "Error",
        description: "Failed to load message templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUsers.length || !templateName) {
      toast({
        title: "Missing Information",
        description: "Please select recipients and template",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending WhatsApp template messages to:', selectedUsers);
      
      for (const userId of selectedUsers) {
        const user = activeUsers.find(u => u.id === userId);
        if (!user?.phone_number) continue;

        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: { 
            action: 'sendMessage',
            phoneNumber: user.phone_number.startsWith('+') ? user.phone_number.substring(1) : user.phone_number,
            templateName,
            languageCode
          },
        });

        if (error || data?.error) {
          console.error('Error sending message to', user.full_name, ':', error || data?.error);
          throw error || data?.error;
        }
      }

      toast({
        title: "Messages Sent",
        description: `WhatsApp messages have been sent to ${selectedUsers.length} recipient${selectedUsers.length > 1 ? 's' : ''}.`,
      });

      setSelectedUsers([]);
    } catch (error: any) {
      console.error('Error sending WhatsApp messages:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send WhatsApp messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    selectedUsers,
    setSelectedUsers,
    templateName,
    setTemplateName,
    languageCode,
    setLanguageCode,
    isSending,
    isLoadingTemplates,
    templates,
    activeUsers,
    isLoadingUsers,
    handleSendMessage,
  };
};