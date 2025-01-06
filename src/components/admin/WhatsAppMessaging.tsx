import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const WhatsAppMessaging = () => {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [languageCode, setLanguageCode] = useState("en_US");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const formatTemplateName = (name: string) => {
    const words = name.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

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

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

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

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === activeUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(activeUsers.map(user => user.id));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send WhatsApp Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between">
            Recipients
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllUsers}
              className="ml-2"
            >
              <Users className="h-4 w-4 mr-2" />
              {selectedUsers.length === activeUsers.length ? 'Deselect All' : 'Select All'}
            </Button>
          </label>
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4 space-y-2">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : activeUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedUsers.includes(user.id) ? "bg-muted" : ""
                  }`}
                  onClick={() => {
                    setSelectedUsers(prev =>
                      prev.includes(user.id)
                        ? prev.filter(id => id !== user.id)
                        : [...prev, user.id]
                    );
                  }}
                >
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{user.full_name || "Unnamed User"}</div>
                    <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                  </div>
                </div>
              ))}
              {!isLoadingUsers && activeUsers.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No active users found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <label htmlFor="template" className="text-sm font-medium">
            Message Template
          </label>
          <Select value={templateName} onValueChange={setTemplateName}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem 
                  key={`${template.name}_${template.language}`} 
                  value={template.name}
                >
                  {formatTemplateName(template.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium">
            Language
          </label>
          <Select value={languageCode} onValueChange={setLanguageCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_US">English(US)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSendMessage} 
          disabled={isSending || selectedUsers.length === 0 || !templateName}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send WhatsApp Message'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;
