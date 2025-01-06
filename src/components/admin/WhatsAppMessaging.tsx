import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const WhatsAppMessaging = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Missing Information",
        description: "Please provide both phone number and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending WhatsApp message:', { phoneNumber, message });
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { phoneNumber, message },
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
      setMessage("");
    } catch (error) {
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
            placeholder="e.g., +1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <Textarea
            id="message"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <Button 
          onClick={handleSendMessage} 
          disabled={isSending || !phoneNumber || !message}
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