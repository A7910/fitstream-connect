import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface UserData {
  email: string;
  fullName: string;
  phoneNumber: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { email, fullName, phoneNumber }: UserData = await req.json()

    // Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: null,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("No user returned from auth signup")

    // Update the profile with additional information
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
      })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ user: authData.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})