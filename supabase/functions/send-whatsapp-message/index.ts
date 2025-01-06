import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message } = await req.json();
    console.log('Request payload:', { phoneNumber, message });
    console.log('Using WhatsApp Phone Number ID:', WHATSAPP_PHONE_NUMBER_ID);

    // Format phone number (remove any spaces, dashes, or parentheses)
    const formattedPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    console.log('Formatted phone number:', formattedPhoneNumber);

    const requestBody = {
      messaging_product: 'whatsapp',
      to: formattedPhoneNumber,
      type: 'text',
      text: { body: message },
    };
    console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    console.log('WhatsApp API response status:', response.status);
    console.log('WhatsApp API response:', data);

    if (!response.ok) {
      console.error('WhatsApp API error:', data.error);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-whatsapp-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});