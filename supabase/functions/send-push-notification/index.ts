import * as webPush from 'npm:web-push'

// Initialize web-push with VAPID keys
const vapidKeys = {
  publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY'),
}

webPush.setVapidDetails(
  'mailto:' + Deno.env.get('VAPID_CONTACT_EMAIL'),
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { subscription, notification } = await req.json()
    
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'FitHub Announcement',
        body: notification.message,
        icon: '/favicon.ico',
      })
    )

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})