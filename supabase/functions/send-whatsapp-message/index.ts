import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const WHATSAPP_BUSINESS_ACCOUNT_ID = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
      console.error('Missing WhatsApp configuration:', { 
        hasToken: !!WHATSAPP_ACCESS_TOKEN, 
        hasPhoneId: !!WHATSAPP_PHONE_NUMBER_ID,
        hasBusinessId: !!WHATSAPP_BUSINESS_ACCOUNT_ID
      });
      throw new Error('WhatsApp configuration is missing');
    }

    const { action, phoneNumber, templateName, languageCode } = await req.json();
    console.log('Received request:', { action, phoneNumber, templateName, languageCode });

    if (action === 'getTemplates') {
      console.log('Fetching WhatsApp templates');
      const templatesUrl = `https://graph.facebook.com/v17.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
      
      const response = await fetch(templatesUrl, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      const templatesData = await response.json();
      console.log('Templates response:', templatesData);

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${JSON.stringify(templatesData.error)}`);
      }

      return new Response(JSON.stringify(templatesData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sendMessage') {
      if (!phoneNumber || !templateName) {
        throw new Error('Missing required parameters for sending message');
      }

      const apiUrl = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      console.log('Using API URL:', apiUrl);

      const requestBody = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode || 'en'
          }
        }
      };

      console.log('Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('WhatsApp API response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ 
            error: responseData.error || 'Failed to send message',
            details: responseData
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
          }
        );
      }

      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})