import { defineMiddleware } from 'astro:middleware'

const PROTECTED_PATH = '/work/wab-2026'
const COOKIE_NAME = 'wab_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context

  if (!url.pathname.startsWith(PROTECTED_PATH)) {
    return next()
  }

  // Already authenticated
  if (context.cookies.get(COOKIE_NAME)?.value === 'authenticated') {
    return next()
  }

  // Get password from Cloudflare env (runtime) or Astro env (dev)
  const runtime = (context.locals as any)?.runtime
  const envPassword = runtime?.env?.WAB_PASSWORD ?? import.meta.env.WAB_PASSWORD

  if (!envPassword) {
    console.warn('WAB_PASSWORD not set — bypassing password gate')
    return next()
  }

  // Handle form submission
  if (request.method === 'POST') {
    try {
      const formData = await request.formData()
      const password = formData.get('password')

      if (password === envPassword) {
        context.cookies.set(COOKIE_NAME, 'authenticated', {
          path: PROTECTED_PATH,
          maxAge: COOKIE_MAX_AGE,
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
        })
        return context.redirect(url.pathname, 302)
      }
    } catch {
      // Bad form data — fall through to show error
    }

    return new Response(passwordPage(true), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Show password form
  return new Response(passwordPage(false), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
})

function passwordPage(error: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Password Required</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #EFF4F5;
      color: #0B0D1B;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      -webkit-font-smoothing: antialiased;
    }
    .gate {
      width: 100%;
      max-width: 360px;
      text-align: center;
    }
    .lock {
      width: 48px;
      height: 48px;
      margin: 0 auto 1.5rem;
      color: #4D5263;
    }
    h1 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }
    .subtitle {
      font-size: 0.82rem;
      color: #4D5263;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.7rem 1rem;
      font-size: 0.9rem;
      font-family: inherit;
      border: 1px solid #DAE5E7;
      border-radius: 4px;
      background: white;
      color: #0B0D1B;
      outline: none;
      transition: border-color 0.15s ease;
    }
    input[type="password"]:focus {
      border-color: #0B0D1B;
      box-shadow: 0 0 0 2px #0B0D1B;
    }
    input[type="password"]::placeholder {
      color: #4D5263;
    }
    button {
      padding: 0.7rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      letter-spacing: 0.02em;
      color: #EFF4F5;
      background: #0B0D1B;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    button:hover { background: #1A1D2E; }
    button:active { background: #000; }
    .error {
      font-size: 0.78rem;
      color: #FF3B4A;
      margin-top: -0.25rem;
    }
    .back {
      display: inline-block;
      margin-top: 1.25rem;
      font-size: 0.75rem;
      color: #4D5263;
      text-decoration: none;
    }
    .back:hover { color: #0B0D1B; }
  </style>
</head>
<body>
  <div class="gate">
    <svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <h1>This case study is password-protected</h1>
    <p class="subtitle">Enter the password to view this project.</p>
    <form method="POST">
      <input type="password" name="password" placeholder="Password" required autofocus autocomplete="current-password" />
      ${error ? '<p class="error">Incorrect password. Try again.</p>' : ''}
      <button type="submit">View Case Study</button>
    </form>
    <a href="/work" class="back">&larr; Back to work</a>
  </div>
</body>
</html>`
}
