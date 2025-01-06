import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const WhatsAppMessaging = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [templateName, setTemplateName] = useState("hello_world");
  const [languageCode, setLanguageCode] = useState("en_US");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!phoneNumber || !templateName) {
      toast({
        title: "Missing Information",
        description: "Please provide both phone number and template",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending WhatsApp template message:', { phoneNumber, templateName, languageCode });
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { 
          phoneNumber: phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber, 
          templateName,
          languageCode
        },
      });

      console.log('WhatsApp API response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('WhatsApp API error:', data.error);
        throw new Error(data.error.message || 'Failed to send WhatsApp message');
      }

      toast({
        title: "Message Sent",
        description: "WhatsApp message has been sent successfully",
      });

      // Clear the form
      setPhoneNumber("");
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send WhatsApp message. Please try again.",
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
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number (with country code)
          </label>
          <Input
            id="phoneNumber"
            placeholder="e.g., +923235896643"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="template" className="text-sm font-medium">
            Message Template
          </label>
          <Select value={templateName} onValueChange={setTemplateName}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hello_world">Hello World</SelectItem>
              {/* Add more templates as needed */}
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
              <SelectItem value="en_US">English (US)</SelectItem>
              <SelectItem value="en_GB">English (UK)</SelectItem>
              {/* Add more languages as needed */}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleSendMessage} 
          disabled={isSending || !phoneNumber || !templateName}
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