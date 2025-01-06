import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, templateName, languageCode } = await req.json();
    console.log('Received request:', { phoneNumber, templateName, languageCode });
    
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('Missing WhatsApp configuration:', { 
        hasToken: !!WHATSAPP_ACCESS_TOKEN, 
        hasPhoneId: !!WHATSAPP_PHONE_NUMBER_ID,
        tokenLength: WHATSAPP_ACCESS_TOKEN?.length,
        phoneIdLength: WHATSAPP_PHONE_NUMBER_ID?.length
      });
      throw new Error('WhatsApp configuration is missing');
    }

    // Format phone number (remove any spaces, dashes, or parentheses)
    const formattedPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
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
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});