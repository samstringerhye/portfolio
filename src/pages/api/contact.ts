import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = { 'Content-Type': 'application/json' }

  try {
    const data = await request.json()
    const { name, email, message, website, form_loaded } = data

    if (website) {
      console.warn('Honeypot triggered', { name, email })
      return new Response(JSON.stringify({ success: true }), { status: 200, headers })
    }

    const elapsed = Date.now() - Number(form_loaded)
    if (!form_loaded || elapsed < 3000) {
      console.warn('Timing check failed', { elapsed })
      return new Response(JSON.stringify({ success: true }), { status: 200, headers })
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400, headers })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), { status: 400, headers })
    }

    if (name.length > 200) {
      return new Response(JSON.stringify({ error: 'Name must be 200 characters or fewer.' }), { status: 400, headers })
    }

    if (email.length > 254) {
      return new Response(JSON.stringify({ error: 'Email must be 254 characters or fewer.' }), { status: 400, headers })
    }

    if (message.length > 10000) {
      return new Response(JSON.stringify({ error: 'Message must be 10,000 characters or fewer.' }), { status: 400, headers })
    }

    const sanitizedName = name.replace(/[\r\n]/g, '')

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
        subject: `Contact from ${sanitizedName}`,
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
