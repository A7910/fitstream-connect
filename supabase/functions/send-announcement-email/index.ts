import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementEmailRequest {
  message: string;
  messageType: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing announcement email request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get announcement details from request
    const { message, messageType }: AnnouncementEmailRequest = await req.json();
    console.log("Announcement details:", { message, messageType });

    // Get all user emails from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error("Failed to fetch user emails");
    }

    // Filter out any undefined emails and get unique emails
    const userEmails = [...new Set(users.users.map(user => user.email).filter(Boolean))] as string[];
    console.log(`Sending announcement to ${userEmails.length} users:`, userEmails);

    if (userEmails.length === 0) {
      throw new Error("No valid user emails found");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    // Send email using Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Gym Management <announcements@resend.dev>",
        to: userEmails, // Using 'to' instead of 'bcc'
        subject: `New Gym Announcement - ${messageType.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Gym Announcement</h2>
            <p style="font-size: 16px; line-height: 1.5;">
              ${message}
            </p>
            <p style="color: #666; font-size: 14px;">
              Type: ${messageType}
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send emails: ${error}`);
    }

    const data = await res.json();
    console.log("Emails sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-announcement-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send emails" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);