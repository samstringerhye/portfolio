import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = { 'Content-Type': 'application/json' }

  try {
    const data = await request.json()
    const { name, email, message } = data

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400, headers })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), { status: 400, headers })
    }

    const env = locals.runtime?.env as Record<string, string> | undefined
    const apiKey = env?.RESEND_API_KEY

    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500, headers })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'Portfolio Contact <contact@samstringerhye.com>',
        to: env.CONTACT_EMAIL || 'sam@samstringerhye.com',
        subject: `Contact from ${name}`,
        reply_to: email,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: 'Failed to send message.' }), { status: 500, headers })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  } catch (e) {
    console.error('Contact form error:', e)
    return new Response(JSON.stringify({ error: 'Something went wrong.' }), { status: 500, headers })
  }
}
