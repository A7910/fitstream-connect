import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, fullName, phoneNumber, password } = await req.json()

    if (!email || !fullName) {
      throw new Error('Email and full name are required')
    }

    console.log('Creating user:', { email, fullName, phoneNumber })

    // Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: password || null, // Use provided password or null for email confirmation
      email_confirm: password ? true : false, // If password is provided, auto-confirm email
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      throw authError
    }

    console.log('User created successfully:', authData)

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
        })
        .eq('id', authData.user.id)

      if (profileError) {
        throw profileError
      }
    }

    return new Response(
      JSON.stringify({ message: 'User created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})