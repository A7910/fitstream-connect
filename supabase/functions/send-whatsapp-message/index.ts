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
        hasBusinessId: !!WHATSAPP_BUSINESS_ACCOUNT_ID,
        tokenLength: WHATSAPP_ACCESS_TOKEN?.length,
        phoneIdLength: WHATSAPP_PHONE_NUMBER_ID?.length
      });
      throw new Error('WhatsApp configuration is missing');
    }

    const { pathname } = new URL(req.url);
    
    // New endpoint to fetch templates
    if (pathname === "/templates") {
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

    // Existing message sending logic
    const { phoneNumber, templateName, languageCode } = await req.json();
    console.log('Received request:', { phoneNumber, templateName, languageCode });

    // Format phone number (remove '+' if present)
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    console.log('Formatted phone number:', formattedPhoneNumber);

    const apiUrl = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    console.log('Using API URL:', apiUrl);
    console.log('Access Token length:', WHATSAPP_ACCESS_TOKEN.length);
    console.log('Phone Number ID:', WHATSAPP_PHONE_NUMBER_ID);

    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedPhoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
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
      console.error('WhatsApp API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      return new Response(
        JSON.stringify({ 
          error: responseData.error || 'Failed to send message',
          details: responseData,
          status: response.status,
          statusText: response.statusText
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
