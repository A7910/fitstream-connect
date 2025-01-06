import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useWhatsAppMessaging } from "@/hooks/useWhatsAppMessaging";
import UserSelector from "./whatsapp/UserSelector";
import TemplateSelector from "./whatsapp/TemplateSelector";
import LanguageSelector from "./whatsapp/LanguageSelector";

const WhatsAppMessaging = () => {
  const {
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
  } = useWhatsAppMessaging();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send WhatsApp Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserSelector
          activeUsers={activeUsers}
          selectedUsers={selectedUsers}
          isLoadingUsers={isLoadingUsers}
          onUserSelectionChange={setSelectedUsers}
        />

        <TemplateSelector
          templates={templates}
          selectedTemplate={templateName}
          isLoadingTemplates={isLoadingTemplates}
          onTemplateChange={setTemplateName}
        />

        <LanguageSelector
          selectedLanguage={languageCode}
          onLanguageChange={setLanguageCode}
        />

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